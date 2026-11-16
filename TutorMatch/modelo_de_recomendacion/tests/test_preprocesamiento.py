"""
test_preprocesamiento.py — Valida el pipeline de NLP en español puro y tensores de PyTorch.
"""

import unittest
import torch

from app.config import MAX_SEQ_LENGTH
from app.preprocesamiento import (
    PAD_IDX,
    UNK_IDX,
    construir_vocabulario,
    limpiar_texto,
    pad_secuencia,
    texto_a_tensor,
    tokens_a_indices,
)


class TestPreprocesamientoNLP(unittest.TestCase):
    def test_limpieza_texto_y_terminos_tecnicos(self):
        texto = "Sistema WEB con IA, RED neuronal y base de datos SQL en la nube!"
        tokens = limpiar_texto(texto)

        # Términos técnicos preservados
        self.assertIn("web", tokens)
        self.assertIn("ia", tokens)
        self.assertIn("red", tokens)
        self.assertIn("sql", tokens)

        # Stopwords eliminadas
        self.assertNotIn("con", tokens)
        self.assertNotIn("de", tokens)
        self.assertNotIn("en", tokens)
        self.assertNotIn("la", tokens)

    def test_quitar_acentos(self):
        tokens = limpiar_texto("Reconocimiento de cáncer y visión por computación")
        self.assertIn("cancer", tokens)
        self.assertIn("vision", tokens)
        self.assertIn("computacion", tokens)

    def test_construccion_vocabulario(self):
        corpus = [["red", "ia", "datos"], ["web", "api", "datos"]]
        vocab = construir_vocabulario(corpus)

        self.assertEqual(vocab["<PAD>"], PAD_IDX)
        self.assertEqual(vocab["<UNK>"], UNK_IDX)
        self.assertIn("red", vocab)
        self.assertIn("ia", vocab)
        self.assertEqual(len(vocab), 7)  # PAD, UNK + 5 tokens únicos

    def test_pad_secuencia(self):
        indices = [2, 3, 4]
        padded = pad_secuencia(indices, max_len=5)
        self.assertEqual(len(padded), 5)
        self.assertEqual(padded, [2, 3, 4, 0, 0])

        truncado = pad_secuencia([1, 2, 3, 4, 5, 6], max_len=4)
        self.assertEqual(len(truncado), 4)
        self.assertEqual(truncado, [1, 2, 3, 4])

    def test_texto_a_tensor_dimension(self):
        vocab = {"<PAD>": 0, "<UNK>": 1, "sistema": 2, "red": 3}
        tensor = texto_a_tensor("Sistema de red desconocido", vocab)

        self.assertIsInstance(tensor, torch.LongTensor)
        self.assertEqual(tensor.shape[0], MAX_SEQ_LENGTH)
        self.assertEqual(tensor[0].item(), 2)  # sistema
        self.assertEqual(tensor[1].item(), 3)  # red
        self.assertEqual(tensor[2].item(), 1)  # desconocido -> UNK


if __name__ == "__main__":
    unittest.main()

