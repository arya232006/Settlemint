def test_file_creation():
    with open('hfhfhfhfhfhfyyfyfy.d', 'r') as f:
        content = f.read()
    assert content == 'hello'
