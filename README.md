# b3d-nav — órbita, pan e zoom no jeito do Blender

![JavaScript](https://img.shields.io/badge/JavaScript-ESM-F7DF1E?logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-exemplo-000000?logo=threedotjs&logoColor=white)

Navegação de viewport no estilo Blender, num único módulo. Não depende de Three.js: recebe qualquer câmera com `position.set`, `up` e `lookAt`. O exemplo usa Three.js só para ter o que orbitar.

## O que cada gesto faz

| Gesto | Efeito |
|---|---|
| Arrastar | Órbita em volta do alvo |
| Shift, ou dois dedos | Deslocamento (pan) do alvo |
| Roda ou pinça | Zoom (raio entre 1.15 e 40) |
| `1` `3` `7` `9` | Frente, direita, topo, trás |

O clique direito no canvas é cancelado para não abrir o menu do navegador. Teclas são ignoradas quando o foco está num `input`, `textarea` ou `select`.

## Stack

- **JavaScript** em módulo ES, zero dependências (`package.json` não instala nada)
- Uma função exportada: `attachBlenderNav(camera, dom, options)`
- Matemática da órbita em `orbitOffset(theta, phi, radius)`, testável sem DOM
- Exemplo com **Three.js 0.170** via import map (CDN), não faz parte da biblioteca

## Estrutura

```
src/
└── b3d-nav.js          # attachBlenderNav, orbitOffset
examples/
└── index.html          # cubo e esfera, câmera PerspectiveCamera
```

## Como rodar

Módulo ES não abre em `file://`. Sirva a pasta:

```bash
git clone https://github.com/gabrielteramae/b3d-nav.git
cd b3d-nav
python -m http.server
```

Abra `http://127.0.0.1:8000/examples/`.

```js
import { attachBlenderNav } from "../src/b3d-nav.js";

const nav = attachBlenderNav(camera, canvas, { target: { x: 0, y: 0.4, z: 0 } });
// nav.setView("front" | "right" | "top" | "back")
// nav.dispose() tira os listeners
```

`options.target` é o ponto orbitado. Se omitido, começa em `{ x: 0, y: 0.6, z: 0 }`. A câmera atual é lida uma vez na hora de anexar (`syncFromCamera`).

## O que não tem

Não desenha a cena, não conhece malha, luz nem controle de transform (gizmo). Não há suíte de testes no repositório: a verificação é o exemplo no navegador.

---

© 2026 Gabriel Teramae Chan
