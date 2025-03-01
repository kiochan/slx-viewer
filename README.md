# **Simulink SLX Viewer** 🚀

A **Next.js** and **ReactFlow**-based web application for **visualizing Simulink (`.slx`) models**. Users can **upload `.slx` files**, parse them into a structured format, store the data in **IndexedDB**, and **interactively explore the model**.

## **Features** ✨

- 📂 **Upload Simulink `.slx` files and parse into json files**
- 📊 **Visualize Simulink models using ReactFlow**
- 🗃 **Store parsed data in IndexedDB for quick access**
- 🔍 **Click on SubSystems to explore nested structures**
- 🖱 **Draggable nodes**

---

## **📌 Getting Started**

### **1️⃣ Install Dependencies**

```sh
npm install
```

### **2️⃣ Start the Development Server**

```sh
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

## **🛠 How It Works**

### **1️⃣ Upload a Simulink File**

- Drag & Drop or click to upload a **`.slx`** file.

### **2️⃣ File Parsing & Storage**

- The server action extracts **XML data from `.slx`**.
- The **Simulink model is parsed** into nodes and edges.
- The parsed **data is stored in IndexedDB** for offline use.

### **3️⃣ Explore the Simulink Model**

- The **Root System** is displayed on `/view`.
- Click on **SubSystems** to navigate deeper into the model.

---

## **🔧 Tech Stack**

- **Next.js (App Router)**
- **ReactFlow (For visualization)**
- **IndexedDB (Client-side storage)**
- **TypeScript**

---

## **💡 Development Notes**

- **Drag & Drop Upload**: The file input supports both manual selection and drag & drop.
- **IndexedDB for Persistence**: Even after page refresh, previously uploaded `.slx` files are accessible.
- **Interactive Flow Diagram**: Clickable **SubSystems** allow for deeper exploration.

---

## **🚀 Future Improvements**

- ✅ **Search & Filter**: Locate specific blocks easily.
- ✅ **Export Model Data**: Allow users to download the parsed JSON.
- ✅ **Live Editing**: Modify block properties in real-time.
- ✅ **Better UI/UX**: More polished visuals & animations.

---

## **🤝 Contributing**

Want to improve this project? Feel free to **submit a PR** or open an **issue**!

---

## **📜 License**

MIT License © 2025
