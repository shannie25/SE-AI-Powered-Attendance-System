import sys
import json
import numpy as np

def generate_embedding(image_path):
    np.random.seed(hash(image_path) % 2**32)
    embedding = np.random.rand(128).tolist()
    return embedding

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({ "error": "No image path provided" }))
        sys.exit(1)

    image_path = sys.argv[1]
    embedding = generate_embedding(image_path)
print(json.dumps({ "embedding": embedding }), flush=True)