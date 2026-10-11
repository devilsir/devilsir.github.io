#!/usr/bin/env python3
"""CHAT CHAOS LAN server — standard library only.
Run: python server.py
Then open the LAN URL shown here on the teacher computer and /buzzer.html on phones.
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json
import math, socket, threading, time, os, tempfile, secrets
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent
PORT = 8765
LOCK = threading.Lock()
QUESTIONS_FILE = ROOT / "teacher-questions.json"
MAX_QUESTIONS_BYTES = 1024 * 1024  # limite de 1 MB, sem dependências extras
GAME = {
    "round": "",
    "teams": [],
    "winner": None,
    "buzzes": [],
    "paused": False,
    "startedAt": time.time(),
    "mode": "projector",
    "gameId": secrets.token_urlsafe(8),
    "question": None,
    "members": {},
    "votes": {},
    "voteClosed": False,
    "voteResults": None,
    "timeLimitSeconds": 0,
    "voteDeadline": None,
    "pauseStarted": None,
}

def json_bytes(obj):
    return json.dumps(obj, ensure_ascii=False).encode("utf-8")

def validate_questions(data):
    if not isinstance(data, dict) or not isinstance(data.get("questions"), list):
        return None
    questions = data["questions"]
    if len(questions) > 500:
        return None
    ids = set()
    clean = []
    for q in questions:
        if not isinstance(q, dict) or not isinstance(q.get("id"), str) or not q["id"].strip():
            return None
        if q["id"] in ids or len(q["id"]) > 100:
            return None
        ids.add(q["id"])
        fields = ("mode", "prompt", "chat", "slang", "explain")
        if any(not isinstance(q.get(f), str) or len(q[f]) > 4000 for f in fields):
            return None
        if not isinstance(q.get("chapter"), int) or q["chapter"] not in range(4):
            return None
        if not isinstance(q.get("correct"), int) or q["correct"] not in range(4):
            return None
        if not isinstance(q.get("answers"), list) or len(q["answers"]) != 4 or any(not isinstance(a, str) or len(a) > 4000 for a in q["answers"]):
            return None
        entry = {k: q[k] for k in ("id", "chapter", "mode", "prompt", "chat", "slang", "answers", "correct", "explain")}
        if "contextPt" in q:
            if not isinstance(q["contextPt"], str) or len(q["contextPt"]) > 4000:
                return None
            entry["contextPt"] = q["contextPt"]
        if "replaces" in q:
            if not isinstance(q["replaces"], int) or not (0 <= q["replaces"] < 10000):
                return None
            entry["replaces"] = q["replaces"]
        clean.append(entry)
    return clean


def read_questions():
    if not QUESTIONS_FILE.is_file():
        return {"exists": False, "questions": []}
    try:
        payload = json.loads(QUESTIONS_FILE.read_text(encoding="utf-8"))
        clean = validate_questions({"questions": payload})
        if clean is None:
            raise ValueError("invalid questions on disk")
        return {"exists": True, "questions": clean}
    except (ValueError, OSError, UnicodeError) as exc:
        return {"error": f"Não foi possível ler teacher-questions.json: {exc}"}


def write_questions(questions):
    # Gravação atômica evita um JSON incompleto se o servidor for interrompido.
    fd, tmp = tempfile.mkstemp(prefix=".chat-chaos-", suffix=".json", dir=ROOT)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            json.dump(questions, stream, ensure_ascii=False, indent=2)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(tmp, QUESTIONS_FILE)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def update_vote_clock():
    deadline = GAME.get("voteDeadline")
    if GAME["mode"] == "vote" and deadline is not None and not GAME["voteClosed"] and not GAME["paused"] and time.time() >= deadline:
        GAME["voteResults"] = tallies()
        GAME["voteClosed"] = True


def public_state():
    update_vote_clock()
    """Never send registration tokens or raw ballots to student devices."""
    payload = {k: v for k, v in GAME.items() if k not in ("members", "votes")}
    payload["teams"] = []
    for team in GAME["teams"]:
        i = int(team["index"])
        people = [m for m in GAME["members"].values() if m["teamIndex"] == i]
        voters = [v for v in GAME["votes"].values() if v["teamIndex"] == i]
        payload["teams"].append({**team, "registered": len(people), "voted": len(voters)})
    now = GAME.get("pauseStarted") if GAME["paused"] else time.time()
    deadline = GAME.get("voteDeadline")
    payload["timeRemainingSeconds"] = max(0, math.ceil(deadline - now)) if deadline is not None else None
    payload["serverTime"] = time.time()
    return payload


def normalize_teams(teams, mode):
    if not isinstance(teams, list) or not (2 <= len(teams) <= 4):
        return None
    clean = []
    for i, t in enumerate(teams):
        if not isinstance(t, dict) or t.get("index") != i:
            return None
        count = t.get("members", 1)
        if isinstance(count, bool) or not isinstance(count, int) or count < 1 or count > 40:
            return None
        clean.append({"index": i, "name": str(t.get("name", f"Equipe {i+1}"))[:40],
                      "avatar": str(t.get("avatar", "⚡"))[:8], "members": count if mode == "vote" else 1})
    return clean


def tallies():
    output=[]
    for team in GAME["teams"]:
        i=team["index"]
        ballots=[v["choice"] for v in GAME["votes"].values() if v["teamIndex"]==i]
        counts=[ballots.count(choice) for choice in range(4)]
        highest=max(counts)
        winners=[x for x,n in enumerate(counts) if n==highest] if highest else []
        output.append({"teamIndex":i,"teamName":team["name"],"counts":counts,
                       "votes":len(ballots),"members":team["members"],
                       "choice":winners[0] if len(winners)==1 else None,
                       "tie":bool(highest and len(winners)>1)})
    return output


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()

    def send_json(self, code, obj):
        data = json_bytes(obj)
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def read_json(self):
        try:
            n = int(self.headers.get("Content-Length", "0"))
            if n < 0 or n > MAX_QUESTIONS_BYTES:
                return None
            return json.loads(self.rfile.read(n) or b"{}")
        except (ValueError, TypeError, json.JSONDecodeError):
            return None

    def do_GET(self):
        path = unquote(self.path.split("?", 1)[0]).replace("\\", "/")
        # Nunca servir diretamente o arquivo editável (inclusive em URLs codificadas).
        if path.rsplit("/", 1)[-1] == "teacher-questions.json" or path.rsplit("/", 1)[-1].startswith(".chat-chaos-"):
            self.send_json(404, {"error": "not_found"})
            return
        if path == "/api/questions":
            with LOCK:
                payload = read_questions()
            self.send_json(500 if "error" in payload else 200, payload)
            return
        if path == "/api/state":
            with LOCK:
                payload = public_state()
            self.send_json(200, payload)
            return
        super().do_GET()

    def do_POST(self):
        path = self.path.split("?",1)[0]
        data = self.read_json()
        if data is None:
            self.send_json(400, {"error": "invalid_json_or_too_large"})
            return
        if path == "/api/questions":
            clean = validate_questions(data)
            if clean is None:
                self.send_json(400, {"error": "invalid_questions"})
                return
            try:
                with LOCK:
                    write_questions(clean)
            except OSError:
                self.send_json(500, {"error": "failed_to_save"})
                return
            self.send_json(200, {"saved": True, "count": len(clean)})
            return
        if path == "/api/pause":
            with LOCK:
                if not isinstance(data, dict) or data.get("round") != GAME["round"] or not GAME["round"]:
                    self.send_json(409, {"error": "stale_round"})
                    return
                update_vote_clock()
                new_paused = bool(data.get("paused", False))
                if new_paused and not GAME["paused"]:
                    GAME["pauseStarted"] = time.time()
                elif not new_paused and GAME["paused"]:
                    if GAME.get("voteDeadline") is not None and GAME.get("pauseStarted") is not None:
                        GAME["voteDeadline"] += time.time() - GAME["pauseStarted"]
                    GAME["pauseStarted"] = None
                GAME["paused"] = new_paused
                payload = {"paused": GAME["paused"], "round": GAME["round"]}
            self.send_json(200, payload)
            return
        if path == "/api/stop":
            if not isinstance(data,dict):
                self.send_json(400,{"error":"invalid_request"});return
            with LOCK:
                if data.get("round")!=GAME["round"]:
                    self.send_json(409,{"error":"stale_round"});return
                GAME.update({"round":"","question":None,"voteClosed":True,"voteResults":None,"votes":{},"winner":None,"paused":False,"voteDeadline":None,"pauseStarted":None,"timeLimitSeconds":0})
            self.send_json(200,{"stopped":True})
            return
        if path == "/api/reset":
            if not isinstance(data, dict):
                self.send_json(400, {"error": "invalid_setup"}); return
            mode = data.get("mode", "projector")
            if mode not in ("projector", "vote"):
                self.send_json(400, {"error": "invalid_mode"}); return
            teams = normalize_teams(data.get("teams"), mode)
            round_id = str(data.get("round", ""))
            question = data.get("question")
            if teams is None or not (0 < len(round_id) <= 100):
                self.send_json(400, {"error": "invalid_teams_or_round"}); return
            limit = data.get("timeLimitSeconds", 0)
            if type(limit) is not int or (limit != 0 and (limit < 30 or limit > 240 or limit % 30 != 0)):
                self.send_json(400, {"error": "invalid_time_limit"}); return
            if mode == "vote":
                if not isinstance(question, dict) or not isinstance(question.get("answers"), list) or len(question["answers"]) != 4:
                    self.send_json(400, {"error": "invalid_question"}); return
                if any(not isinstance(x, str) or len(x) > 1500 for x in question["answers"]):
                    self.send_json(400, {"error": "invalid_answers"}); return
                question = {"prompt":str(question.get("prompt", ""))[:1500],
                            "chat":str(question.get("chat", ""))[:1500],
                            "answers":question["answers"], "words":[[str(w[0])[:30],str(w[1])[:90]] for w in question.get("words",[])[:12] if isinstance(w,(list,tuple)) and len(w)==2 and isinstance(w[0],str) and isinstance(w[1],str)], "type": "boss" if question.get("type")=="boss" else "normal"}
            else:
                question = None
            with LOCK:
                # Registrations survive each new question, not a change in team setup or game mode.
                previous = [(t["index"],t["name"],t["members"]) for t in GAME["teams"]]
                incoming = [(t["index"],t["name"],t["members"]) for t in teams]
                if GAME["mode"] != mode or previous != incoming or data.get("newGame") is True:
                    GAME["members"] = {}
                    GAME["gameId"] = secrets.token_urlsafe(8)
                GAME.update({"round": round_id, "teams":teams, "mode":mode, "question":question,
                             "winner":None,"buzzes":[],"votes":{},"voteClosed":False,
                             "voteResults":None,"paused":False,"startedAt":time.time(),"pauseStarted":None,
                             "timeLimitSeconds":limit if mode == "vote" else 0,
                             "voteDeadline":time.time()+limit if mode == "vote" and limit else None})
                payload = public_state()
            self.send_json(200, payload)
            return
        if path == "/api/join":
            if not isinstance(data,dict):
                self.send_json(400, {"error":"invalid_join"});return
            token = str(data.get("token") or "")
            try: index = int(data.get("teamIndex"))
            except (ValueError, TypeError): index=-1
            name = str(data.get("nickname") or "Aluno").strip()[:30]
            if not name: name = "Aluno"
            with LOCK:
                team = next((t for t in GAME["teams"] if t["index"]==index),None)
                if GAME["mode"]!="vote" or team is None:
                    self.send_json(409, {"error":"not_in_vote_mode"});return
                registered = GAME["members"].get(token)
                if registered:
                    if registered["teamIndex"] != index:
                        self.send_json(409, {"error":"registered_other_team"});return
                    registered["nickname"] = name
                else:
                    occupied = sum(1 for person in GAME["members"].values() if person["teamIndex"]==index)
                    if occupied >= team["members"]:
                        self.send_json(409, {"error":"team_full"});return
                    token=secrets.token_urlsafe(24)
                    GAME["members"][token]={"teamIndex":index,"nickname":name}
                self.send_json(200,{"joined":True,"token":token,"teamIndex":index})
            return
        if path == "/api/leave":
            token = str(data.get("token") or "") if isinstance(data,dict) else ""
            with LOCK:
                if token in GAME["votes"]:
                    self.send_json(409,{"error":"already_voted"});return
                GAME["members"].pop(token,None)
                self.send_json(200,{"left":True})
            return
        if path == "/api/vote":
            if not isinstance(data, dict):
                self.send_json(400,{"error":"invalid_vote"});return
            token = str(data.get("token") or "")
            choice = data.get("choice")
            with LOCK:
                if GAME["mode"]!="vote" or not GAME["round"] or data.get("round")!=GAME["round"]:
                    self.send_json(409,{"error":"stale_round"});return
                update_vote_clock()
                if GAME["voteClosed"]:
                    self.send_json(409,{"error":"vote_closed"});return
                if GAME["paused"]:
                    self.send_json(409,{"error":"paused"});return
                member = GAME["members"].get(token)
                if member is None:
                    self.send_json(403,{"error":"not_registered"});return
                if type(choice) is not int or choice not in range(4):
                    self.send_json(400,{"error":"invalid_choice"});return
                if token in GAME["votes"]:
                    self.send_json(409,{"error":"already_voted"});return
                GAME["votes"][token]={"teamIndex":member["teamIndex"],"choice":choice}
                self.send_json(200,{"accepted":True,"round":GAME["round"]})
            return
        if path == "/api/close-vote":
            if not isinstance(data, dict):
                self.send_json(400,{"error":"invalid_request"});return
            with LOCK:
                if GAME["mode"]!="vote" or data.get("round")!=GAME["round"] or not GAME["round"]:
                    self.send_json(409,{"error":"stale_round"});return
                if GAME["paused"]:
                    self.send_json(409,{"error":"paused"});return
                update_vote_clock()
                if not GAME["voteClosed"]:
                    GAME["voteResults"] = tallies()
                    GAME["voteClosed"] = True
                self.send_json(200,{"closed":True,"round":GAME["round"],"results":GAME["voteResults"]})
            return
        if path == "/api/buzz":
            with LOCK:
                try: team_index = int(data.get("teamIndex"))
                except Exception: team_index = -1
                team = next((t for t in GAME["teams"] if int(t.get("index", -99)) == team_index), None)
                if GAME["mode"] == "vote":
                    self.send_json(409, {"error": "use_vote_endpoint"})
                    return
                if GAME["paused"]:
                    self.send_json(200, {"accepted": False, "reason": "paused", "round": GAME["round"]})
                    return
                if not GAME["round"] or team is None:
                    self.send_json(400, {"accepted": False, "reason": "invalid_round_or_team"})
                    return
                now = time.time()
                buzz = {
                    "teamIndex": team_index,
                    "teamName": str(team.get("name", f"Team {team_index+1}"))[:40],
                    "avatar": str(team.get("avatar", "⚡"))[:8],
                    "nickname": str(data.get("nickname", ""))[:30],
                    "ms": round((now - GAME["startedAt"]) * 1000),
                    "at": now,
                }
                GAME["buzzes"].append(buzz)
                accepted = GAME["winner"] is None
                if accepted:
                    GAME["winner"] = buzz
                payload = {"accepted": accepted, "winner": GAME["winner"], "round": GAME["round"]}
            self.send_json(200, payload)
            return
        self.send_json(404, {"error":"not_found"})

    def log_message(self, fmt, *args):
        # Keep classroom terminal readable: only API errors and startup matter.
        if "/api/" in str(args[0]) and str(args[1]) not in {"200", "304"}:
            super().log_message(fmt, *args)

def local_ip():
    try:
        s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
        s.connect(("8.8.8.8",80)); ip=s.getsockname()[0];s.close();return ip
    except Exception:
        try:return socket.gethostbyname(socket.gethostname())
        except Exception:return "127.0.0.1"

if __name__ == "__main__":
    os.chdir(ROOT)
    ip=local_ip()
    print("\n" + "="*62)
    print("  CHAT CHAOS // CLASSROOM LAN SERVER")
    print("="*62)
    print(f"  PROFESSOR: http://{ip}:{PORT}/")
    print(f"  ALUNOS:    http://{ip}:{PORT}/buzzer.html")
    print("  Todos precisam estar no mesmo Wi-Fi.")
    print("  Para encerrar: Ctrl+C")
    print("="*62 + "\n")
    try:
        ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
