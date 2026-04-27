# 🌍 Weatherminus

**Weatherminus** is a lightweight and fun Python console application that calculates the exact antipode (the diametrically opposite point on Earth) of your location and retrieves its real-time weather data.

> Ever wondered what’s happening on the exact opposite side of the world right now? 🌎  
> With Weatherminus, you can find out instantly.

---

## ✨ Features

- 🌐 **Antipode Calculation**  
  Accurately computes the opposite coordinates (latitude & longitude) of any given location.

- 🌦️ **Real-Time Weather Data**  
  Fetches live weather information using the OpenWeatherMap API.

- 💬 **Smart Status Messages**  
  Displays a fun contextual message based on the weather conditions.

- ⚡ **Minimal & Fast**  
  Simple, dependency-light console application.

---

## 🧠 How It Works

1. You provide a location (latitude & longitude).
2. The app calculates its antipode:
   - Latitude → inverted  
   - Longitude → shifted by 180°
3. It sends a request to the weather API.
4. Displays the weather + a fun status message.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/beratbesli/weatherminus.git
cd weatherminus
2. Install Dependencies
pip install -r requirements.txt
3. Get an API Key
Go to: https://openweathermap.org/api
Sign up and get your free API key
```
Then open weatherminus.py and replace:
API_KEY = "YOUR_API_KEY_HERE"
with:
API_KEY = "your_actual_api_key"
4. Run the Application
python weatherminus.py

⚙️ Configuration

By default, the application uses coordinates for Edirne, Turkey:
current_lat, current_lon = 41.67, 26.56
You can change these values to any location:
current_lat = YOUR_LATITUDE
current_lon = YOUR_LONGITUDE
📌 Example Output
--- WEATHERMINUS ---
Currently at your exact opposite point on Earth (the Middle of the Ocean):
Weather: 22°C, Clear sky.

Status:
The weather is actually not bad there, but there is no place like home!

⚠️ Notes
If no city is found, the location will be shown as "the Middle of the Ocean" 🌊
Make sure your API key is valid, otherwise the app won’t return data.

🛠️ Built With
Python 🐍
requests library
OpenWeatherMap API

💡 Future Improvements
🌍 Auto-detect user location
🖥️ GUI version (Tkinter / PyQt)
📱 Mobile-friendly version
🌐 Multiple language support
📄 License

This project is open-source and available under the MIT License.

👨‍💻 Author

Developed by Berat Beşli
⭐ If you like this project, consider giving it a star!
