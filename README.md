# b3d-nav

Navegação de viewport no estilo Blender, em JavaScript puro. Não depende de Three.js: recebe uma câmera com `position.set`, `up` e `lookAt`.

- arrastar: órbita
- Shift ou dois dedos: desloca
- roda ou pinça: zoom
- `1` frente, `3` direita, `7` topo, `9` trás

## Exemplo

```bash
python -m http.server
```

Abra `examples/index.html` pelo servidor (módulo ES não abre em `file://`).
