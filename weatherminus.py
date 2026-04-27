import requests

API_KEY = "YOUR_API_KEY_HERE"

def get_antipode(lat, lon):
    """Calculates the exact opposite point on Earth."""
    opposite_lat = -lat
    opposite_lon = lon + 180
    if opposite_lon > 180:
        opposite_lon -= 360
    return opposite_lat, opposite_lon

# Set your current coordinates (Default: Edirne)
current_lat, current_lon = 41.67, 26.56
opp_lat, opp_lon = get_antipode(current_lat, current_lon)


url = f"http://api.openweathermap.org/data/2.5/weather?lat={opp_lat}&lon={opp_lon}&appid={API_KEY}&units=metric&lang=en"

try:
    response = requests.get(url).json()
    
    if response.get("main"):
        temp = response["main"]["temp"]
        description = response["weather"][0]["description"]
        
        location = response.get("name")
        if not location:
            location = "the Middle of the Ocean"
        
        print("--- WEATHERMINUS ---")
        print(f"Currently at your exact opposite point on Earth ({location}):")
        print(f"Weather: {temp}°C, {description.capitalize()}.")
        
        print("\nStatus:")
        if temp < 10:
            print("It's freezing over there! Be glad you're in a warm place writing code.")
        elif "rain" in description:
            print("It's raining there right now. Be happy you are staying dry!")
        else:
            print("The weather is actually not bad there, but there is no place like home!")
    else:
        print("Could not retrieve weather data. Please check your API key.")

except Exception as e:
    print(f"An error occurred: {e}")