 # 📦 Inventory Management - Paper Rolls

This is a complete system for managing the stock and movement of paper rolls, developed with usability and practicality in mind for printing and packaging industries.

## ✅ Features

- Registration of paper rolls with fields such as paper type, weight, grammage, manufacturer, and more.
- Control of entries, outputs, and returns of rolls.
- Generation of derived rolls and sheets.
- Full movement history tracking.
- Modal views with QR Code display.
- Printable roll labels.
- Filtering, tabs, and intuitive interface.
- Automated reports by period and current inventory.

## 🧠 Technologies Used

### Frontend
- HTML5 + CSS3
- Vanilla JavaScript
- JSBarcode and QRCode.js (for code generation)
- Responsive and print-ready layout

### Backend (example)
- Node.js + Express
- MongoDB Atlas (cloud database)
- RESTful API with routes for rolls, movements, and sheets
- Deployment via [Render](https://render.com)

> ⚠️ The backend API used is hosted at:  
> https://bobinas.onrender.com
## 📦 How to Run

### Frontend (locally)

1. Clone the repository:
bash
git clone https://github.com/yourusername/paper-rolls-inventory.git

Open the index.html file directly in your browser.

The system automatically connects to the online API.

Backend (optional)
To run it locally:

bash
Copiar
Editar
cd backend
npm install
npm run dev
Configure the .env file:

env
Copiar
Editar
MONGODB_URI= your_mongodb_connection_string
PORT=5000
📈 Automated Reports
Current Inventory

Movement by Period (with date filters)

(Coming soon) Minimum Stock Alerts

🔐 Authentication
The system can be extended with JWT authentication or route protection middleware (in progress).

✍️ Author
Developed by Gustavo Pizatto
📧 Contact: gustavopizatto@hotmail.com

