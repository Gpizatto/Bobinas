![image](https://github.com/user-attachments/assets/16c232ec-f944-45e8-8957-ae6eb812ec5a)

📦 Sistema de Gestão de Estoque – Bobinas de Papel
Este é um sistema completo para gerenciamento do estoque e movimentação de bobinas de papel, desenvolvido com foco em usabilidade e praticidade para as indústrias de impressão e embalagens.

✅ Funcionalidades
Cadastro de bobinas com campos como tipo de papel, peso, gramatura, fabricante e mais.

Controle de entradas, saídas e retornos de bobinas.

Geração de bobinas e folhas derivadas.

Histórico completo de movimentações.

Visualização em modal com exibição de QR Code.

Etiquetas para bobinas para impressão.

Filtros, abas e interface intuitiva.

Relatórios automáticos por período e estoque atual.

🧠 Tecnologias Utilizadas
Frontend
HTML5 + CSS3

JavaScript puro (Vanilla JS)

JSBarcode e QRCode.js (para geração de códigos)

Layout responsivo e pronto para impressão

Backend (exemplo)
Node.js + Express

MongoDB Atlas (banco de dados na nuvem)

API REST com rotas para bobinas, movimentações e folhas

Deploy via Render

⚠️ A API backend utilizada está hospedada em:
https://bobinas.onrender.com

📦 Como Rodar
Frontend (localmente)
Clone o repositório:

bash
Copiar
Editar
git clone https://github.com/yourusername/paper-rolls-inventory.git
Abra o arquivo index.html diretamente no seu navegador.

O sistema conecta automaticamente à API online.

Backend (opcional)
Para rodar localmente:

bash
Copiar
Editar
cd backend
npm install
npm run dev
Configure o arquivo .env:

ini
Copiar
Editar
MONGODB_URI= sua_string_de_conexão_mongodb
PORT=5000
📈 Relatórios Automáticos
Estoque Atual

Movimentação por Período (com filtros de data)

(Em breve) Alertas de Estoque Mínimo

🔐 Autenticação
O sistema pode ser ampliado com autenticação JWT ou proteção de rotas via middleware (em desenvolvimento).

✍️ Autor
Desenvolvido por Gustavo Pizatto
📧 Contato: gustavopizatto@hotmail.com
