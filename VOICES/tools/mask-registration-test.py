"""Measure rigid facial landmarks in the exported sprites, not silhouette centers."""
from pathlib import Path
from PIL import Image
import json
import unittest
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'assets/adventure/mask-styles'
REGISTRATION = json.loads((TARGET / 'registration.json').read_text(encoding='utf8'))


def tile(image, row, col):
    return image.crop((col * 192, row * 192, (col + 1) * 192, (row + 1) * 192))


def pixels(image):
    array = np.asarray(image, dtype=np.float32)
    return array[:, :, :3] * array[:, :, 3:4] / 255


def landmark_drift(reference, frame, region):
    # A local comparison of the fixed forehead/nose patch ignores changing
    # eyes, mouth and silhouette. The old exports fail by up to 18px vertically
    # and 47px horizontally; search far enough to detect that regression.
    x0, y0, x1, y1 = region
    template = pixels(reference)[y0:y1, x0:x1]
    candidate = pixels(frame)
    scores = []
    for dy in range(-20, 21):
        for dx in range(-50, 51):
            if not (0 <= x0 + dx < x1 + dx <= 192 and 0 <= y0 + dy < y1 + dy <= 192):
                continue
            patch = candidate[y0+dy:y1+dy, x0+dx:x1+dx]
            score = float(np.minimum(np.abs(patch - template), 96).mean())
            scores.append((score + .003 * (dx * dx + dy * dy), dx, dy))
    _, dx, dy = min(scores)
    return dx, dy


class RegistrationTests(unittest.TestCase):
    def test_fixed_face_does_not_jump_across_animation_states(self):
        report = {}
        for model, metadata in REGISTRATION['models'].items():
            image = Image.open(TARGET / f'{model}-atlas.webp').convert('RGBA')
            dx, dy = metadata['offsets'][0]
            region = tuple(value + (dx if index % 2 == 0 else dy)
                           for index, value in enumerate(metadata['region']))
            front = tile(image, 0, 0)
            worst = [0, 0]
            for row in range(8):
                # Perspective changes how a forehead is drawn. Compare each
                # side's four blink phases to its own calibrated first pose.
                reference = tile(image, row, 0) if row in (1, 2) else front
                for col in range(4):
                    with self.subTest(model=model, row=row, col=col):
                        x, y = landmark_drift(reference, tile(image, row, col), region)
                        worst = [max(worst[0], abs(x)), max(worst[1], abs(y))]
                        self.assertLessEqual(abs(x), 1, 'rigid facial landmark jumped horizontally')
                        self.assertLessEqual(abs(y), 1, 'rigid facial landmark jumped vertically')
            report[model] = {'maxHorizontalDrift': worst[0], 'maxVerticalDrift': worst[1]}
        review = ROOT / '.qa/review'
        review.mkdir(parents=True, exist_ok=True)
        (review / 'mask-registration-results.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf8')

    def test_exported_cells_keep_clear_borders_and_complete_content(self):
        for model in REGISTRATION['models']:
            image = Image.open(TARGET / f'{model}-atlas.webp').convert('RGBA')
            self.assertEqual(image.size, (768, 1536))
            for row in range(8):
                for col in range(4):
                    with self.subTest(model=model, row=row, col=col):
                        alpha = np.asarray(tile(image, row, col))[:, :, 3]
                        self.assertTrue(np.any(alpha > 200))
                        self.assertFalse(alpha[0, :].any() or alpha[-1, :].any()
                                         or alpha[:, 0].any() or alpha[:, -1].any())


if __name__ == '__main__':
    unittest.main()
