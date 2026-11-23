from pathlib import Path
from subprocess import run


if __name__ == '__main__':
    run(['node', str(Path(__file__).with_suffix('.cjs'))], check=True)
