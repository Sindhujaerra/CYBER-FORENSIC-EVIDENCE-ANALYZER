import random

# Define story templates based on mood
story_templates = {
    "happy": [
        "It was a bright and sunny day, and {name} felt on top of the world. With a spring in their step, they {activity}, enjoying every moment.",
        "{name} couldn't stop smiling as they {activity}. The world seemed full of endless possibilities!"
    ],
    "sad": [
        "The rain drizzled down as {name} walked slowly, lost in thought. {event} weighed heavily on their mind.",
        "A deep sigh escaped {name}'s lips. They {activity}, trying to find solace in the simple things."
    ],
    "adventurous": [
        "With a map in one hand and excitement in their heart, {name} set off on a journey to {place}. Who knew what awaited them?",
        "{name} took a deep breath before stepping into the unknown. The path ahead was mysterious, but that only made it more thrilling."
    ],
    "mysterious": [
        "The old mansion stood before {name}, its windows dark and foreboding. A strange sound came from inside, drawing them closer.",
        "A cryptic message arrived at {name}'s door. With curiosity burning, they {activity} to uncover its secrets."
    ]
}

# User inputs
mood = input("What is your mood? (happy, sad, adventurous, mysterious): ").strip().lower()
name = input("Enter a name for the protagonist: ").strip()

# Additional random elements
activities = ["went for a walk", "read their favorite book", "danced in the rain", "explored a new place"]
events = ["a lost letter", "an old photograph", "a sudden realization", "a bittersweet memory"]
places = ["a hidden temple", "a forgotten city", "a distant island", "an enchanted forest"]

# Generate story
if mood in story_templates:
    story = random.choice(story_templates[mood])
    story = story.format(
        name=name,
        activity=random.choice(activities),
        event=random.choice(events),
        place=random.choice(places)
    )
    print("\nGenerated Story:\n" + story)
else:
    print("Sorry, mood not recognized. Try happy, sad, adventurous, or mysterious.")