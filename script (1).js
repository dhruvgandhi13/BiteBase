/* ============================================================
   BiteBase – Indian Recipe Finder | script.js
   API: TheMealDB (free, no key needed)
   ============================================================ */

'use strict';

// ── CONSTANTS ──────────────────────────────────────────────
const MEAL_API = 'https://www.themealdb.com/api/json/v1/1';
const MAX_RECENTS = 6;

// Indian cuisine keywords for searching
const INDIAN_KEYWORDS = [
  'chicken', 'paneer', 'dal', 'biryani', 'curry', 'rice', 'lentil',
  'lamb', 'potato', 'spinach', 'chickpea', 'naan', 'samosa', 'aloo',
  'masala', 'korma', 'tikka', 'palak', 'mutter', 'chana', 'roti',
  'dosa', 'idli', 'rasam', 'pongal', 'upma', 'halwa', 'kheer', 'pulao'
];

// Veg/Vegan category overrides (MealDB doesn't always flag these)
const VEG_MEALS = new Set(['Vegetarian', 'Vegan', 'Breakfast']);
const VEGAN_CATS = new Set(['Vegan', 'Vegetarian']);

// Cuisine-region mapping for filter chips
const REGION_MAP = {
  'north-indian': ['indian', 'mughal', 'punjabi'],
  'south-indian': ['south indian', 'tamil', 'kerala'],
  'punjabi':      ['punjabi'],
  'gujarati':     ['gujarati'],
  'street-food':  ['street', 'chaat', 'snack'],
  'healthy':      ['vegetarian', 'vegan', 'salad', 'soup'],
};

// Sample static Indian recipes to supplement API (used when API doesn't return enough)
const LOCAL_RECIPES = [
  // ─────────────────────────────────────────────
  // 25 VEGAN RECIPES  (local-002 … local-026)
  // ─────────────────────────────────────────────
  {
    idMeal: 'local-002',
    strMeal: 'Chana Masala',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6huVVNqYGRKbpD0nvOUCI53uEorfhpOLalPXPRjWW_JYP9bOaq9q6a-Gs4wloDZJfGRV6HwqOf1RsfQG-W_yzwuk_2ALJ-uK-nZEuyg&s=10',
    strInstructions: 'Heat oil in a pan and sauté onions until golden brown. Add ginger-garlic paste and cook for 2 minutes. Stir in tomatoes, cumin, coriander, garam masala, and chili powder; cook until the oil separates. Add soaked and boiled chickpeas along with a cup of water. Simmer for 15 minutes, stirring occasionally. Finish with a squeeze of lemon juice and fresh coriander leaves.',
    tags: 'chickpeas, curry, protein, spicy',
    preference: 'vegan',
    time: '35 min',
    desc: 'Bold, tangy chickpea curry simmered in a rich spiced tomato gravy — a North Indian street-food classic.',
    ingredients: ['Chickpeas', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Cumin seeds', 'Coriander powder', 'Garam masala', 'Chili powder', 'Lemon juice', 'Fresh coriander', 'Oil', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-003',
    strMeal: 'Pad Thai with Tofu',
    strCategory: 'Noodles',
    strArea: 'Thai',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7BI7HFXIqp093Nqe9Gri5Ls2u9RVUk8JWAw&s',
    strInstructions: 'Soak rice noodles in warm water for 20 minutes, then drain. Press and cube firm tofu, then pan-fry until golden on all sides. In a wok over high heat, stir-fry garlic and shallots in oil for one minute. Add noodles, soy sauce, tamarind paste, and palm sugar; toss well. Push noodles to the side and scramble in a flax egg substitute. Toss everything together with bean sprouts and spring onions. Serve topped with crushed peanuts, lime wedges, and chili flakes.',

    tags: 'noodles, thai, tofu, stir-fry',
    preference: 'vegan',
    time: '30 min',
    desc: 'Wok-tossed rice noodles with crispy tofu, tamarind tang, and a crunch of roasted peanuts.',
    ingredients: ['Rice noodles', 'Firm tofu', 'Tamarind paste', 'Soy sauce', 'Palm sugar', 'Bean sprouts', 'Spring onions', 'Garlic', 'Shallots', 'Crushed peanuts', 'Lime', 'Chili flakes', 'Oil'],
    region: 'thai',
  },
  {
    idMeal: 'local-004',
    strMeal: 'Baingan Bharta',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://upbeetanisha.com/wp-content/uploads/2022/01/DSC_0498.jpg',
    strInstructions: 'Roast eggplant directly over a flame, turning occasionally, until the skin is charred and the flesh is soft. Peel and mash the flesh. Heat oil in a pan, add cumin seeds and sauté onions until translucent. Add ginger, garlic, and green chilies; cook for 2 minutes. Stir in chopped tomatoes and cook until mushy. Add the mashed eggplant, turmeric, and garam masala; cook for 8 minutes. Garnish with fresh coriander and serve with roti.',
    tags: 'eggplant, smoky, curry, roasted',
    preference: 'vegan',
    time: '40 min',
    desc: 'Smoky flame-roasted eggplant mashed with spiced onions and tomatoes — rustic and deeply flavorful.',
    ingredients: ['Eggplant', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Green chili', 'Cumin seeds', 'Turmeric', 'Garam masala', 'Fresh coriander', 'Oil', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-005',
    strMeal: 'Mexican Black Bean Tacos',
    strCategory: 'Wraps',
    strArea: 'Mexican',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzL6E4i6WQ7lbG3yJa8g4pQMGxxFIfjZw-mQ&s',
    strInstructions: 'Drain and rinse black beans, then warm them in a pan with cumin, smoked paprika, and a pinch of salt. Warm corn tortillas directly on a dry skillet for 30 seconds per side. Mash avocado with lime juice and a pinch of salt to make a quick guacamole. Assemble tacos by layering black beans, guacamole, shredded cabbage, and pico de gallo. Top with pickled jalapeños and a drizzle of hot sauce.',
    tags: 'tacos, mexican, black beans, street food',
    preference: 'vegan',
    time: '20 min',
    desc: 'Smoky spiced black beans piled into warm corn tortillas with guac, cabbage crunch, and fiery salsa.',
    ingredients: ['Black beans', 'Corn tortillas', 'Avocado', 'Lime', 'Red cabbage', 'Pico de gallo', 'Cumin', 'Smoked paprika', 'Pickled jalapeños', 'Hot sauce', 'Salt'],
    region: 'mexican',
  },
  {
    idMeal: 'local-006',
    strMeal: 'Dal Tadka',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9_UKZve1kLKIIlXWxu6UWc-rhh8AJj1n-bA&s',
    strInstructions: 'Boil yellow lentils with turmeric and salt until completely soft. In a separate pan, heat ghee substitute (coconut oil) and crackle mustard and cumin seeds. Add dried red chilies and a generous pinch of asafoetida. Toss in finely chopped garlic and fry until golden. Add sliced onion and cook until caramelized, then add tomatoes and cook until broken down. Pour the tadka over the cooked lentils and stir together. Simmer for 5 minutes, then finish with lemon juice and coriander.',
    tags: 'lentils, dal, comfort food, protein',
    preference: 'vegan',
    time: '30 min',
    desc: 'Velvety yellow lentils lifted by a sizzling cumin-garlic tempering — India\'s ultimate comfort bowl.',
    ingredients: ['Yellow lentils', 'Onion', 'Tomato', 'Garlic', 'Cumin seeds', 'Mustard seeds', 'Dried red chili', 'Asafoetida', 'Turmeric', 'Coconut oil', 'Lemon juice', 'Fresh coriander', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-007',
    strMeal: 'Avocado Toast with Microgreens',
    strCategory: 'Breakfast',
    strArea: 'American',
    strMealThumb: 'https://static.thedaringkitchen.com/wp-content/uploads/2021/06/Carrot-bacon-avocado-toast-14-scaled.jpg',
    strInstructions: 'Toast thick slices of sourdough bread until golden and crisp. Mash ripe avocados with lemon juice, garlic powder, red chili flakes, and sea salt. Spread the avocado mixture generously over each toast slice. Top with a handful of mixed microgreens and sliced cherry tomatoes. Drizzle extra-virgin olive oil over the top and finish with flaky sea salt and black pepper.',
    tags: 'breakfast, avocado, toast, healthy',
    preference: 'vegan',
    time: '10 min',
    desc: 'Creamy smashed avocado on crunchy sourdough crowned with fresh microgreens and a drizzle of olive oil.',
    ingredients: ['Sourdough bread', 'Avocado', 'Lemon juice', 'Garlic powder', 'Red chili flakes', 'Microgreens', 'Cherry tomatoes', 'Extra-virgin olive oil', 'Sea salt', 'Black pepper'],
    region: 'american',
  },
  {
    idMeal: 'local-008',
    strMeal: 'Mango Coconut Chia Pudding',
    strCategory: 'Dessert',
    strArea: 'Global',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSK2kmI9j-5tZh2GIWihSRoX6Guu_X-6S_A-A&s',
    strInstructions: 'Whisk chia seeds into coconut milk with maple syrup and vanilla extract. Pour into jars and refrigerate overnight or for at least 4 hours until set. Blend fresh mango with a squeeze of lime juice until silky smooth. Layer the mango coulis over the set chia pudding. Top with diced fresh mango, toasted coconut flakes, and a sprig of mint before serving.',
    tags: 'dessert, chia, mango, no-cook',
    preference: 'vegan',
    time: '10 min + chill',
    desc: 'Silky coconut chia pudding layered with tropical mango coulis — effortless, gorgeous, and nourishing.',
    ingredients: ['Chia seeds', 'Coconut milk', 'Maple syrup', 'Vanilla extract', 'Fresh mango', 'Lime juice', 'Toasted coconut flakes', 'Fresh mint'],
    region: 'global',
  },
  {
    idMeal: 'local-009',
    strMeal: 'Mushroom Ramen',
    strCategory: 'Soups',
    strArea: 'Japanese',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSZ_XgX5OWTWUK1TOBMU1ubZIQcUIsjFvWMg&s',
    strInstructions: 'Simmer dried shiitake mushrooms and kombu in water for 30 minutes to build a deep umami broth; strain and season with soy sauce and miso paste. Cook ramen noodles separately per packet instructions. Sauté king oyster mushrooms in sesame oil until caramelized. Arrange noodles in a bowl, ladle hot broth over them, and top with sautéed mushrooms, bamboo shoots, nori, spring onions, and a drizzle of chili oil.',
    tags: 'ramen, japanese, mushroom, umami',
    preference: 'vegan',
    time: '50 min',
    desc: 'Deep umami shiitake-kombu broth cradling springy noodles and caramelized mushrooms — bowl perfection.',
    ingredients: ['Ramen noodles', 'Dried shiitake mushrooms', 'Kombu', 'King oyster mushrooms', 'Miso paste', 'Soy sauce', 'Sesame oil', 'Bamboo shoots', 'Nori', 'Spring onions', 'Chili oil'],
    region: 'japanese',
  },
  {
    idMeal: 'local-010',
    strMeal: 'Stuffed Bell Peppers',
    strCategory: 'Mains',
    strArea: 'Mediterranean',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1Cclg0-s92RAoF5ExVRF1-hDOsJtIUG_euA&s',
    strInstructions: 'Halve and deseed bell peppers and place them cut-side up in a baking dish. Cook quinoa according to instructions and mix with black beans, corn, diced tomatoes, cumin, smoked paprika, and fresh coriander. Fill each pepper half generously with the quinoa mixture. Drizzle with olive oil and bake at 200°C for 30 minutes until the peppers are tender. Top with sliced avocado and a squeeze of lime before serving.',
    tags: 'bell peppers, quinoa, baked, stuffed',
    preference: 'vegan',
    time: '45 min',
    desc: 'Vibrant peppers stuffed with herbed quinoa and black beans — a wholesome, colorful crowd-pleaser.',
    ingredients: ['Bell peppers', 'Quinoa', 'Black beans', 'Corn', 'Tomatoes', 'Cumin', 'Smoked paprika', 'Fresh coriander', 'Avocado', 'Lime', 'Olive oil', 'Salt'],
    region: 'mediterranean',
  },
  {
    idMeal: 'local-011',
    strMeal: 'Aloo Gobi',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://www.flourandspiceblog.com/wp-content/uploads/2023/01/IMG_9608.jpg',
    strInstructions: 'Heat oil and add cumin seeds; let them crackle. Add diced potatoes and cauliflower florets, toss to coat in oil. Stir in turmeric, coriander powder, cumin powder, and chili powder. Cover and cook on medium heat for 15 minutes, stirring every few minutes. Once vegetables are tender, add garam masala and amchur powder. Finish with fresh coriander and serve hot with chapati.',
    tags: 'potato, cauliflower, dry curry, indian',
    preference: 'vegan',
    time: '30 min',
    desc: 'Tender golden potato and cauliflower tossed in warm spices — a humble classic that never disappoints.',
    ingredients: ['Potatoes', 'Cauliflower', 'Cumin seeds', 'Turmeric', 'Coriander powder', 'Cumin powder', 'Chili powder', 'Garam masala', 'Amchur powder', 'Fresh coriander', 'Oil', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-012',
    strMeal: 'Greek Falafel Bowl',
    strCategory: 'Salad',
    strArea: 'Middle Eastern',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUmmfEkO5Lj_c_ODJE7Ws4cB5V16IW1Uirsg&s',
    strInstructions: 'Soak dried chickpeas overnight and blend with parsley, garlic, onion, cumin, coriander, and a pinch of baking powder. Form into balls and shallow-fry until deep golden and crispy. Prepare a bowl base of couscous or brown rice. Add sliced cucumber, cherry tomatoes, kalamata olives, and red onion. Place falafels on top and drizzle with tahini thinned with lemon juice and water. Finish with sumac and fresh parsley.',
    tags: 'falafel, chickpeas, bowl, middle eastern',
    preference: 'vegan',
    time: '40 min',
    desc: 'Crispy herbed falafels nestled over fresh greens with creamy tahini drizzle and bright Mediterranean toppings.',
    ingredients: ['Dried chickpeas', 'Parsley', 'Garlic', 'Onion', 'Cumin', 'Coriander', 'Baking powder', 'Couscous', 'Cucumber', 'Cherry tomatoes', 'Kalamata olives', 'Red onion', 'Tahini', 'Lemon juice', 'Sumac'],
    region: 'middle-eastern',
  },
  {
    idMeal: 'local-013',
    strMeal: 'Palak Tofu',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtPFr7eJ40-rv0jsNiSpY7ONouqhvvmszNIg&s',
    strInstructions: 'Blanch spinach in boiling water for 2 minutes, then blend into a smooth purée. Pan-fry cubed firm tofu in oil until golden on all sides; set aside. In the same pan, sauté onions, ginger, and garlic until golden. Add tomatoes, cumin, garam masala, and chili powder; cook until oil separates. Stir in the spinach purée and simmer for 5 minutes. Fold in the crispy tofu, adjust seasoning, and finish with a squeeze of lemon.',
    tags: 'spinach, tofu, green curry, protein',
    preference: 'vegan',
    time: '35 min',
    desc: 'Lush emerald spinach gravy embracing golden tofu cubes — a plant-based spin on the beloved palak paneer.',
    ingredients: ['Spinach', 'Firm tofu', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Cumin', 'Garam masala', 'Chili powder', 'Lemon juice', 'Oil', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-014',
    strMeal: 'Lentil Soup with Lemon',
    strCategory: 'Soups',
    strArea: 'Lebanese',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTGrv12GfFo5dZHQ4bMaDJsmhzgeMQNfKvjg&s',
    strInstructions: 'Sauté diced onion and garlic in olive oil until softened. Add red lentils, vegetable broth, cumin, turmeric, and smoked paprika; bring to a boil. Reduce heat and simmer for 20 minutes until lentils break down. Blend partially for a creamy yet textured consistency. Squeeze in generous lemon juice and season with salt. Make a quick red pepper and cumin oil by frying paprika in oil, and drizzle over each bowl. Garnish with fresh parsley.',
    tags: 'lentil, soup, lebanese, lemon',
    preference: 'vegan',
    time: '30 min',
    desc: 'Velvety red lentil soup with a bright lemon lift and smoky red pepper drizzle — warming and nourishing.',
    ingredients: ['Red lentils', 'Onion', 'Garlic', 'Vegetable broth', 'Cumin', 'Turmeric', 'Smoked paprika', 'Lemon juice', 'Olive oil', 'Red pepper', 'Fresh parsley', 'Salt'],
    region: 'lebanese',
  },
  {
    idMeal: 'local-015',
    strMeal: 'Vegetable Biryani',
    strCategory: 'Rice',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWGa9pM2gZQkKGYDs5Vein0Ayi1ybocLYOeg&s',
    strInstructions: 'Parboil basmati rice with whole spices (bay leaf, cardamom, clove, star anise) until 70% cooked; drain. Sauté onions until dark golden; remove half for garnish. Add mixed vegetables, ginger-garlic paste, yogurt alternative (coconut yogurt), and biryani masala; cook for 5 minutes. Layer half the rice over the vegetables, top with saffron-infused water, mint, caramelized onions, and remaining rice. Seal the pot with foil, then a lid, and dum-cook on low heat for 25 minutes. Gently fluff and serve with raita.',
    tags: 'biryani, rice, festive, dum cooking',
    preference: 'vegan',
    time: '1 hour',
    desc: 'Fragrant saffron-kissed basmati layered with spiced vegetables — a regal dum biryani that wows every time.',
    ingredients: ['Basmati rice', 'Mixed vegetables', 'Onion', 'Ginger-garlic paste', 'Coconut yogurt', 'Biryani masala', 'Saffron', 'Bay leaf', 'Cardamom', 'Cloves', 'Star anise', 'Mint leaves', 'Oil', 'Salt'],
    region: 'south-indian',
  },
  {
    idMeal: 'local-016',
    strMeal: 'Thai Green Curry',
    strCategory: 'Curry',
    strArea: 'Thai',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf1LBbSpisf3JfbhtBH713Gjr-Lctjkts44g&s',
    strInstructions: 'Fry vegan green curry paste in coconut oil for 2 minutes until fragrant. Pour in coconut milk and vegetable stock; bring to a simmer. Add bite-sized pieces of zucchini, baby corn, snap peas, and tofu. Simmer for 12 minutes until vegetables are just tender. Season with soy sauce, palm sugar, and a squeeze of lime. Add torn Thai basil leaves and serve over jasmine rice with extra lime wedges.',
    tags: 'thai, green curry, coconut, tofu',
    preference: 'vegan',
    time: '25 min',
    desc: 'Fragrant, creamy green coconut curry brimming with vegetables and tofu — a Thai takeaway at home.',
    ingredients: ['Vegan green curry paste', 'Coconut milk', 'Vegetable stock', 'Firm tofu', 'Zucchini', 'Baby corn', 'Snap peas', 'Soy sauce', 'Palm sugar', 'Thai basil', 'Lime', 'Jasmine rice', 'Coconut oil'],
    region: 'thai',
  },
  {
    idMeal: 'local-017',
    strMeal: 'Masoor Dal',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://www.cubesnjuliennes.com/wp-content/uploads/2020/09/Whole-Masoor-Dal-Recipe.jpg',
    strInstructions: 'Pressure-cook red lentils with diced tomatoes, turmeric, and water until soft. In a pan, heat oil and add cumin seeds, dried chilies, and curry leaves; let them pop. Add finely minced garlic and cook until golden. Stir in chili powder and pour the tempered oil over the cooked dal. Mix well and simmer for 5 minutes. Finish with chopped coriander and lemon juice.',
    tags: 'lentil, dal, protein, quick',
    preference: 'vegan',
    time: '25 min',
    desc: 'Earthy red lentils with a crackling cumin-garlic tadka — quick, protein-rich, and deeply satisfying.',
    ingredients: ['Red lentils', 'Tomatoes', 'Garlic', 'Cumin seeds', 'Dried red chili', 'Curry leaves', 'Turmeric', 'Chili powder', 'Lemon juice', 'Fresh coriander', 'Oil', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-018',
    strMeal: 'Mujaddara',
    strCategory: 'Rice',
    strArea: 'Lebanese',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVFc58z8pG6aXVGPsHbHGgRoLAkQ0kAxV46A&s',
    strInstructions: 'Cook green or brown lentils in salted water until just tender; drain. In a pot, fry long-grain rice in a splash of olive oil for 2 minutes, add lentils, water, salt, cumin, and coriander; bring to a boil, then simmer covered for 20 minutes. Meanwhile, slowly caramelize thinly sliced onions in olive oil over low heat for 30 minutes until deeply golden. Pile the lentil rice into a dish, top with caramelized onions, and serve with a cucumber-tomato salad and vegan yogurt.',
    tags: 'lentils, rice, lebanese, caramelized onions',
    preference: 'vegan',
    time: '50 min',
    desc: 'Spiced lentil-and-rice pilaf crowned with melt-in-your-mouth caramelized onions — Middle Eastern soul food.',
    ingredients: ['Green lentils', 'Long-grain rice', 'Onion', 'Olive oil', 'Cumin', 'Coriander', 'Salt', 'Cucumber', 'Tomato'],
    region: 'lebanese',
  },
  {
    idMeal: 'local-019',
    strMeal: 'Vegan Buddha Bowl',
    strCategory: 'Salad',
    strArea: 'American',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbLJyQVR0ichX_JUVfkMIyV8OrgNgddh2WIQ&s',
    strInstructions: 'Roast cubed sweet potato and chickpeas at 200°C with olive oil, cumin, and paprika for 25 minutes until caramelized. Cook brown rice or quinoa per package instructions. Massage shredded kale with a tiny bit of olive oil and lemon juice until tender. Assemble bowls with a base of grains, then sections of kale, roasted sweet potato, chickpeas, sliced avocado, shredded purple cabbage, and edamame. Drizzle with a tahini-lemon dressing and sprinkle with sesame seeds.',
    tags: 'bowl, rainbow, healthy, meal prep',
    preference: 'vegan',
    time: '40 min',
    desc: 'A nourishing, rainbow-bright bowl packed with roasted vegetables, grains, and creamy tahini dressing.',
    ingredients: ['Sweet potato', 'Chickpeas', 'Brown rice', 'Kale', 'Avocado', 'Purple cabbage', 'Edamame', 'Tahini', 'Lemon juice', 'Olive oil', 'Cumin', 'Smoked paprika', 'Sesame seeds', 'Salt'],
    region: 'american',
  },
  {
    idMeal: 'local-020',
    strMeal: 'Sambar',
    strCategory: 'Soups',
    strArea: 'Indian',
    strMealThumb: 'https://www.cookwithmanali.com/wp-content/uploads/2019/05/Sambar-Recipe.jpg',
    strInstructions: 'Cook toor dal with turmeric until soft. Fry mustard seeds, dried red chilies, and curry leaves in oil until fragrant. Add pearl onions, tomatoes, and drumstick pieces; sauté briefly. Add tamarind water and sambar powder; cook for 10 minutes. Combine with cooked dal and simmer together for 15 minutes. Adjust consistency with water and season with salt and jaggery for balance.',
    tags: 'sambar, lentil, south indian, tamarind',
    preference: 'vegan',
    time: '40 min',
    desc: 'Tangy tamarind-and-lentil stew packed with drumsticks and vegetables — the soul of South Indian cooking.',
    ingredients: ['Toor dal', 'Tamarind', 'Drumstick', 'Pearl onions', 'Tomato', 'Sambar powder', 'Mustard seeds', 'Curry leaves', 'Dried red chili', 'Turmeric', 'Jaggery', 'Oil', 'Salt'],
    region: 'south-indian',
  },
  {
    idMeal: 'local-021',
    strMeal: 'Spaghetti Aglio e Olio',
    strCategory: 'Pasta',
    strArea: 'Italian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeUfuD1hfvzyJ_6AAuxe55FnlnGf0HF0cCBA&s',
    strInstructions: 'Cook spaghetti in heavily salted boiling water until al dente; reserve one cup of pasta water before draining. Meanwhile, gently heat sliced garlic in abundant olive oil over low heat until pale golden and fragrant — do not let it burn. Add chili flakes to the oil. Toss the drained spaghetti in the garlic oil, adding pasta water a splash at a time to form a glossy emulsified sauce. Finish with a big handful of chopped flat-leaf parsley and lemon zest.',
    tags: 'pasta, italian, garlic, quick',
    preference: 'vegan',
    time: '20 min',
    desc: 'Midnight pantry pasta — silky spaghetti bathed in golden garlic oil with a fiery chili kick.',
    ingredients: ['Spaghetti', 'Garlic', 'Extra-virgin olive oil', 'Red chili flakes', 'Flat-leaf parsley', 'Lemon zest', 'Salt'],
    region: 'italian',
  },
  {
    idMeal: 'local-022',
    strMeal: 'Korean Bibimbap (Vegan)',
    strCategory: 'Rice',
    strArea: 'Korean',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHzj0GDMGCVS_ZfHbZL6W6Ho_-Zn4tcVZdGg&s',
    strInstructions: 'Cook short-grain rice and keep warm. Individually sauté spinach, bean sprouts, shredded carrots, and zucchini in sesame oil, seasoning each with soy sauce and garlic. Marinate sliced shiitake mushrooms in soy sauce and sesame oil; pan-fry until glossy. Arrange a bowl of rice and place each vegetable in neat sections around the bowl. Top with a spoonful of gochujang mixed with sesame oil and rice vinegar. Drizzle with sesame oil and scatter toasted sesame seeds.',
    tags: 'korean, rice, bibimbap, gochujang',
    preference: 'vegan',
    time: '45 min',
    desc: 'A gorgeous Korean rice bowl with rainbow vegetables and spicy gochujang — mix it all together for magic.',
    ingredients: ['Short-grain rice', 'Spinach', 'Bean sprouts', 'Carrot', 'Zucchini', 'Shiitake mushrooms', 'Gochujang', 'Soy sauce', 'Sesame oil', 'Garlic', 'Rice vinegar', 'Toasted sesame seeds'],
    region: 'korean',
  },
  {
    idMeal: 'local-023',
    strMeal: 'Jackfruit Pulled BBQ Sandwich',
    strCategory: 'Wraps',
    strArea: 'American',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiTerYCg850QH3uL_ECRWttuiCm9rVz3UxJw&s',
    strInstructions: 'Drain and rinse young green jackfruit, then shred with two forks. Sauté onion and garlic in oil until soft, add jackfruit, smoked paprika, cumin, and chipotle powder; cook for 5 minutes. Pour in BBQ sauce and vegetable broth; simmer on low heat for 20 minutes, stirring occasionally, until the jackfruit absorbs the sauce and resembles pulled pork. Toast brioche buns (vegan). Pile the jackfruit high, top with crunchy coleslaw made from cabbage, apple cider vinegar, and a little maple syrup.',
    tags: 'jackfruit, bbq, sandwich, smoky',
    preference: 'vegan',
    time: '35 min',
    desc: 'Smoky BBQ pulled jackfruit on a toasted bun with tangy slaw — even meat-eaters will do a double take.',
    ingredients: ['Young green jackfruit', 'Vegan BBQ sauce', 'Onion', 'Garlic', 'Smoked paprika', 'Cumin', 'Chipotle powder', 'Vegetable broth', 'Vegan buns', 'Red cabbage', 'Apple cider vinegar', 'Maple syrup', 'Oil'],
    region: 'american',
  },
  {
    idMeal: 'local-024',
    strMeal: 'Masala Oats',
    strCategory: 'Breakfast',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoWs6NM1ZHlEU77GO7ufmIiGvTpyqNw-gG1w&s',
    strInstructions: 'Heat oil and add mustard seeds, cumin seeds, and curry leaves; let them splutter. Sauté finely chopped onion, ginger, and green chili until soft. Add diced tomatoes, turmeric, and chili powder; cook for 3 minutes. Add rolled oats and water; stir and cook on medium heat for 5 minutes until creamy. Season with salt and finish with a squeeze of lemon and fresh coriander.',
    tags: 'oats, breakfast, savory, quick',
    preference: 'vegan',
    time: '15 min',
    desc: 'Savory spiced oats with a South Indian tempering — a speedy, wholesome breakfast with serious flavor.',
    ingredients: ['Rolled oats', 'Onion', 'Tomato', 'Ginger', 'Green chili', 'Mustard seeds', 'Cumin seeds', 'Curry leaves', 'Turmeric', 'Chili powder', 'Lemon juice', 'Fresh coriander', 'Oil', 'Salt'],
    region: 'south-indian',
  },
  {
    idMeal: 'local-025',
    strMeal: 'Vegan Chocolate Avocado Mousse',
    strCategory: 'Dessert',
    strArea: 'Global',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd8KJc8Zzp3CYQRBiq6nHrqWiQ9seuOJNMkQ&s',
    strInstructions: 'Blend ripe avocados, unsweetened cocoa powder, maple syrup, vanilla extract, and a pinch of sea salt in a food processor until completely smooth and glossy. Taste and adjust sweetness with more maple syrup if needed. Spoon into glasses or ramekins and refrigerate for at least 1 hour. Top with fresh berries, a dusting of cocoa powder, and a sprinkle of flaky sea salt. Serve chilled.',
    tags: 'dessert, chocolate, avocado, no-bake',
    preference: 'vegan',
    time: '10 min + chill',
    desc: 'Impossibly rich and silky chocolate mousse made entirely from avocado — luscious, dairy-free indulgence.',
    ingredients: ['Ripe avocados', 'Cocoa powder', 'Maple syrup', 'Vanilla extract', 'Sea salt', 'Fresh berries'],
    region: 'global',
  },
  {
    idMeal: 'local-026',
    strMeal: 'Chole Bhature',
    strCategory: 'Mains',
    strArea: 'Indian',
    strMealThumb: 'https://nutriscan.app/calories-nutrition/images/chole-bhature-8230b.webp',
    strInstructions: 'Make bhature dough by mixing maida, semolina, a little sugar, salt, and enough water to form a soft dough; let it rest for 30 minutes. Prepare chole by pressure-cooking soaked chickpeas. Sauté a spice base of onion, tomato, ginger-garlic, and whole spices; add chana masala, pomegranate powder, and the cooked chickpeas; simmer for 20 minutes. Roll dough into rounds and deep-fry until puffed and golden. Serve hot chole alongside the bhature with pickled onions and green chutney.',
    tags: 'chole, bhature, street food, punjabi',
    preference: 'vegan',
    time: '1 hour',
    desc: 'Punjab\'s ultimate street-food duo — spiced chickpea curry paired with gloriously puffed fried bread.',
    ingredients: ['Chickpeas', 'Maida', 'Semolina', 'Onion', 'Tomato', 'Ginger-garlic paste', 'Chana masala', 'Pomegranate powder', 'Whole spices', 'Pickled onions', 'Green chutney', 'Oil', 'Salt'],
    region: 'north-indian',
  },

  // ─────────────────────────────────────────────
  // 50 VEGETARIAN RECIPES  (local-027 … local-076)
  // ─────────────────────────────────────────────
  {
    idMeal: 'local-027',
    strMeal: 'Paneer Tikka Masala',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://cdn.prod.website-files.com/65e2ec4e51f6693a3af9151d/660bbc2bf96bfa42f8c93333_f0ef7b68-009e-4c37-bdd5-f67ca31339eb.webp',
    strInstructions: 'Marinate paneer cubes in yogurt, tikka masala spices, lemon juice, and salt for 30 minutes. Grill or broil until charred on edges. Make the masala sauce by frying onion purée with ginger-garlic paste, tomato purée, cashew cream, and spices until the oil separates. Add the grilled paneer and fresh cream; simmer for 10 minutes. Garnish with cream swirls and fresh coriander.',
    tags: 'paneer, tikka, masala, restaurant style',
    preference: 'vegetarian',
    time: '50 min',
    desc: 'Smoky grilled paneer in a luxuriously creamy tomato-cashew masala — the king of vegetarian curries.',
    ingredients: ['Paneer', 'Yogurt', 'Tikka masala spice mix', 'Tomato purée', 'Onion', 'Ginger-garlic paste', 'Cashew cream', 'Heavy cream', 'Lemon juice', 'Fresh coriander', 'Butter', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-028',
    strMeal: 'Caprese Salad',
    strCategory: 'Salad',
    strArea: 'Italian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAkBBTcSnnuxP55DC0_ToyTkQcacu_Z3lvKg&s',
    strInstructions: 'Slice ripe beef tomatoes and fresh buffalo mozzarella into even 1 cm rounds. Arrange alternating slices of tomato and mozzarella on a large platter. Scatter torn fresh basil leaves generously over the top. Drizzle with extra-virgin olive oil and aged balsamic glaze. Season with flaky sea salt and freshly cracked black pepper. Serve immediately at room temperature.',
    tags: 'salad, italian, fresh, mozzarella',
    preference: 'vegetarian',
    time: '10 min',
    desc: 'The holy trinity of ripe tomato, fresh mozzarella, and basil — Italy\'s most elegant no-cook salad.',
    ingredients: ['Beef tomatoes', 'Buffalo mozzarella', 'Fresh basil', 'Extra-virgin olive oil', 'Balsamic glaze', 'Flaky sea salt', 'Black pepper'],
    region: 'italian',
  },
  {
    idMeal: 'local-029',
    strMeal: 'Masala Dosa',
    strCategory: 'Breakfast',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDc4ujAHMme0fUaKzqCSBeRJzmzH4gF_xe5g&s',
    strInstructions: 'Soak rice and urad dal separately for 6 hours, then blend together with salt and water to a smooth batter. Ferment overnight. For the filling, sauté mustard seeds, curry leaves, and onions in oil; add turmeric and boiled mashed potatoes; cook for 5 minutes. Pour batter onto a hot greased griddle, spread in a thin circle, and cook until crisp. Place potato filling in the centre, fold, and serve with coconut chutney and sambar.',
    tags: 'dosa, south indian, breakfast, crispy',
    preference: 'vegetarian',
    time: '8 hours + 20 min',
    desc: 'Paper-thin fermented rice crêpe crisped to gold, stuffed with spiced potato masala — South India\'s icon.',
    ingredients: ['Rice', 'Urad dal', 'Potato', 'Onion', 'Mustard seeds', 'Curry leaves', 'Turmeric', 'Oil', 'Salt', 'Coconut chutney', 'Sambar'],
    region: 'south-indian',
  },
  {
    idMeal: 'local-031',
    strMeal: 'Margherita Pizza',
    strCategory: 'Mains',
    strArea: 'Italian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpWOkeCCgMKCQygnqFhp14LyKDUHabnoh-1w&s',
    strInstructions: 'Make pizza dough with flour, yeast, salt, olive oil, and warm water; knead for 10 minutes and let rise for 1 hour. Blend San Marzano tomatoes with salt and basil for the sauce. Stretch dough into a thin round on a floured surface. Spread sauce leaving a 2 cm border, tear fresh mozzarella over the top, and drizzle with olive oil. Bake at 250°C on a preheated pizza stone for 10-12 minutes until the crust is charred. Top with fresh basil immediately after baking.',
    tags: 'pizza, italian, classic, mozzarella',
    preference: 'vegetarian',
    time: '1 hr 30 min',
    desc: 'The timeless Neapolitan classic — blistered crust, sweet San Marzano sauce, and pools of fresh mozzarella.',
    ingredients: ['Pizza flour', 'Yeast', 'San Marzano tomatoes', 'Fresh mozzarella', 'Fresh basil', 'Extra-virgin olive oil', 'Salt'],
    region: 'italian',
  },
  {
    idMeal: 'local-032',
    strMeal: 'Methi Thepla',
    strCategory: 'Breakfast',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIsZ5whPGjzIP4vl4YSo0-uXOyzzNYdM5uOg&s',
    strInstructions: 'Mix whole wheat flour, fresh fenugreek leaves, yogurt, turmeric, red chili powder, cumin seeds, sesame seeds, and salt with enough water to form a soft dough. Divide into small balls, roll into thin circles. Cook on a hot tawa with a little oil, pressing gently, until golden spots appear on both sides. Serve hot with mango pickle and yogurt.',
    tags: 'thepla, gujarati, flatbread, fenugreek',
    preference: 'vegetarian',
    time: '25 min',
    desc: 'Soft, spiced whole-wheat flatbreads laden with fresh fenugreek — a Gujarati staple beloved on travel days.',
    ingredients: ['Whole wheat flour', 'Fresh fenugreek leaves', 'Yogurt', 'Turmeric', 'Red chili powder', 'Cumin seeds', 'Sesame seeds', 'Oil', 'Salt'],
    region: 'gujarati',
  },
  {
    idMeal: 'local-033',
    strMeal: 'Pasta Primavera',
    strCategory: 'Pasta',
    strArea: 'Italian',
    strMealThumb: 'https://www.feastingathome.com/wp-content/uploads/2026/03/Pasta-Primavera-9.jpg',
    strInstructions: 'Cook penne until al dente; reserve pasta water. Sauté garlic in olive oil, add asparagus, peas, cherry tomatoes, and zucchini; cook for 5 minutes until crisp-tender. Toss in the drained pasta with a ladleful of pasta water, lemon zest, and lemon juice to create a light sauce. Add a generous handful of Parmesan and toss vigorously. Finish with fresh basil and black pepper.',
    tags: 'pasta, vegetables, spring, Italian',
    preference: 'vegetarian',
    time: '25 min',
    desc: 'A celebration of spring vegetables tossed with pasta in a bright lemony sauce finished with Parmesan.',
    ingredients: ['Penne', 'Asparagus', 'Peas', 'Cherry tomatoes', 'Zucchini', 'Garlic', 'Lemon', 'Parmesan', 'Fresh basil', 'Olive oil', 'Salt', 'Black pepper'],
    region: 'italian',
  },
  {
    idMeal: 'local-034',
    strMeal: 'Rasam',
    strCategory: 'Soups',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0fFn8bijygA-lsNAZmP7-8j9aB3cfvqnkMw&s',
    strInstructions: 'Boil tamarind extract with tomato, garlic, and black pepper for 10 minutes. Add thin cooked toor dal and rasam powder; bring to a boil. In a separate small pan, heat ghee and add mustard seeds, cumin, dried red chili, and curry leaves; pour over the rasam. Simmer for 5 minutes and finish with fresh coriander. Serve as a soup or with rice.',
    tags: 'rasam, south indian, soup, tamarind',
    preference: 'vegetarian',
    time: '20 min',
    desc: 'Fiery, peppery tamarind broth with a ghee tempering — South India\'s medicinal and soul-restoring soup.',
    ingredients: ['Tamarind', 'Tomato', 'Garlic', 'Black pepper', 'Toor dal', 'Rasam powder', 'Mustard seeds', 'Cumin', 'Curry leaves', 'Dried red chili', 'Ghee', 'Fresh coriander', 'Salt'],
    region: 'south-indian',
  },
  {
    idMeal: 'local-035',
    strMeal: 'Khichdi',
    strCategory: 'Rice',
    strArea: 'Indian',
    strMealThumb: 'https://smithakalluraya.com/wp-content/uploads/2025/05/veg-khichdi.jpg',
    strInstructions: 'Rinse rice and moong dal together thoroughly. Heat ghee in a pressure cooker and add cumin seeds, bay leaf, ginger, and green chili; sauté for 1 minute. Add rice and dal; stir to coat. Add water, turmeric, and salt; pressure cook for 3 whistles. Allow steam to release naturally. Mash lightly for a porridge-like consistency. Finish with an extra knob of ghee and serve with yogurt and pickle.',
    tags: 'khichdi, comfort, rice, dal',
    preference: 'vegetarian',
    time: '25 min',
    desc: 'India\'s ultimate hug in a bowl — soft spiced rice and lentils cooked together with a golden ghee drizzle.',
    ingredients: ['Rice', 'Moong dal', 'Ghee', 'Cumin seeds', 'Bay leaf', 'Ginger', 'Green chili', 'Turmeric', 'Salt', 'Yogurt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-036',
    strMeal: 'Cheese Quesadillas',
    strCategory: 'Wraps',
    strArea: 'Mexican',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH_t2uH9AqiTaFQENCIR6cu_MA6n-ReA1LgA&s',
    strInstructions: 'Heat a skillet over medium heat and lightly grease with butter. Place a flour tortilla in the pan; sprinkle one half with shredded Oaxaca cheese, sautéed peppers and onions, and black beans. Fold the other half over the filling. Cook for 2-3 minutes per side until golden and the cheese is fully melted. Cut into wedges and serve with sour cream, guacamole, and pico de gallo.',
    tags: 'quesadilla, cheese, mexican, quick',
    preference: 'vegetarian',
    time: '15 min',
    desc: 'Golden, crispy tortilla oozing with melted cheese and pepper filling — the ultimate satisfying quick meal.',
    ingredients: ['Flour tortillas', 'Oaxaca cheese', 'Bell peppers', 'Onion', 'Black beans', 'Butter', 'Sour cream', 'Guacamole', 'Pico de gallo'],
    region: 'mexican',
  },
  {
    idMeal: 'local-037',
    strMeal: 'Poha',
    strCategory: 'Breakfast',
    strArea: 'Indian',
    strMealThumb: 'https://www.ohmyveg.co.uk/wp-content/uploads/2023/09/Poha-4-copy-3-e1722868478363.jpg',
    strInstructions: 'Rinse flattened rice gently under water and let drain for 5 minutes. Heat oil and fry mustard seeds, cumin, curry leaves, green chili, and onion until soft. Add turmeric and peanuts; fry for 2 minutes. Toss in the flattened rice, mix well, and cover for 3 minutes on low heat. Finish with lemon juice, sugar, and fresh coriander. Serve garnished with sev and grated fresh coconut.',
    tags: 'poha, breakfast, maharashtrian, quick',
    preference: 'vegetarian',
    time: '15 min',
    desc: 'Light, tangy flattened rice tossed with peanuts and spices — Maharashtra\'s beloved morning classic.',
    ingredients: ['Flattened rice', 'Onion', 'Peanuts', 'Mustard seeds', 'Cumin', 'Curry leaves', 'Green chili', 'Turmeric', 'Lemon juice', 'Sugar', 'Fresh coriander', 'Sev', 'Fresh coconut', 'Oil'],
    region: 'maharashtrian',
  },
  {
    idMeal: 'local-038',
    strMeal: 'Ratatouille',
    strCategory: 'Mains',
    strArea: 'French',
    strMealThumb: 'https://images.ctfassets.net/0e6jqcgsrcye/4teTkS26yJgQ4N30ofmyhX/33d2415ad06349ebb7ec030afdfc1db8/summerratatouille_thumbnail.webp',
    strInstructions: 'Make a piperade base by cooking blended onion, garlic, bell pepper, and crushed tomatoes in olive oil for 20 minutes. Season generously. Thinly slice zucchini, yellow squash, eggplant, and tomatoes on a mandoline. Arrange overlapping slices in a spiral pattern over the piperade in a baking dish. Drizzle with olive oil and thyme; cover with parchment. Bake at 160°C for 1.5 hours until tender and melting. Serve as a main or side.',
    tags: 'french, vegetables, baked, provençal',
    preference: 'vegetarian',
    time: '2 hours',
    desc: 'Provence\'s showstopping tian of thinly sliced summer vegetables baked over a rich tomato piperade.',
    ingredients: ['Zucchini', 'Yellow squash', 'Eggplant', 'Tomatoes', 'Bell pepper', 'Onion', 'Garlic', 'Crushed tomatoes', 'Thyme', 'Olive oil', 'Salt', 'Black pepper'],
    region: 'french',
  },
  {
    idMeal: 'local-039',
    strMeal: 'Idli Sambhar',
    strCategory: 'Breakfast',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjsxtLVQbBtL72NgiIEGRNWtfR1oKNCUFVMg&s',
    strInstructions: 'Soak rice and urad dal separately for 5 hours; grind to a smooth batter; ferment overnight. Add salt and pour into greased idli moulds. Steam for 12-15 minutes until cooked through. Meanwhile, prepare sambar by simmering toor dal with tamarind, vegetables, and sambar powder. Make fresh coconut chutney by blending coconut, green chili, ginger, and tempering with mustard seeds and curry leaves.',
    tags: 'idli, sambar, south indian, breakfast',
    preference: 'vegetarian',
    time: '8 hours + 30 min',
    desc: 'Cloud-soft steamed rice cakes served with tangy sambar and fresh coconut chutney — South India\'s breakfast royalty.',
    ingredients: ['Idli rice', 'Urad dal', 'Toor dal', 'Tamarind', 'Mixed vegetables', 'Sambar powder', 'Coconut', 'Green chili', 'Ginger', 'Mustard seeds', 'Curry leaves', 'Salt'],
    region: 'south-indian',
  },
  {
    idMeal: 'local-040',
    strMeal: 'Spanakopita',
    strCategory: 'Mains',
    strArea: 'Greek',
    strMealThumb: 'https://cdn.vegkit.com/wp-content/uploads/sites/2/2022/10/19172704/VegKit_Spanakopita.jpg',
    strInstructions: 'Sauté chopped spinach and spring onions in olive oil until wilted; cool completely and squeeze out all moisture. Mix with crumbled feta, ricotta, eggs, dill, and nutmeg. Brush a baking dish with olive oil and layer 6 sheets of buttered phyllo, letting edges overhang. Add the filling, fold in the overhanging pastry, then crumple remaining phyllo sheets on top. Score the top, drizzle with olive oil, and bake at 180°C for 45 minutes until deeply golden.',
    tags: 'greek, spinach, feta, pastry',
    preference: 'vegetarian',
    time: '1 hr 15 min',
    desc: 'Flaky, crispy phyllo pie stuffed with creamy spinach and feta — the crown jewel of Greek baking.',
    ingredients: ['Phyllo pastry', 'Spinach', 'Spring onions', 'Feta', 'Ricotta', 'Eggs', 'Dill', 'Nutmeg', 'Olive oil', 'Butter'],
    region: 'greek',
  },
  {
    idMeal: 'local-041',
    strMeal: 'Rajma Chawal',
    strCategory: 'Rice',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY-RAucfta9NuMA4bvQfyLL_ARIIZpfnhi1g&s',
    strInstructions: 'Soak kidney beans overnight and pressure cook until very tender. Fry onion until deep golden, then add blended tomatoes, ginger-garlic paste, and spices (coriander, cumin, garam masala, chili powder); cook until oil separates. Add beans with their cooking liquid; simmer for 25 minutes until gravy thickens. Finish with a knob of butter and fresh coriander. Serve over steamed basmati rice.',
    tags: 'rajma, kidney beans, rice, punjabi',
    preference: 'vegetarian',
    time: '1 hr',
    desc: 'Hearty red kidney beans in a deep spiced tomato gravy over steamed rice — North India\'s Sunday favourite.',
    ingredients: ['Kidney beans', 'Basmati rice', 'Onion', 'Tomato', 'Ginger-garlic paste', 'Coriander powder', 'Cumin', 'Garam masala', 'Chili powder', 'Butter', 'Fresh coriander', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-042',
    strMeal: 'Mushroom Risotto',
    strCategory: 'Rice',
    strArea: 'Italian',
    strMealThumb: 'https://www.eatingwell.com/thmb/j7BysZSxkHk2zCmnHUjSwwqrX4Y=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/mushroom-risotto-beauty-8025316-4000x2700-33aa288ff4ce4b8d854618fab2109a95.jpg',
    strInstructions: 'Warm vegetable stock in a separate pot. Sauté shallots and garlic in butter and olive oil until soft; add Arborio rice and toast for 2 minutes. Deglaze with white wine and stir until absorbed. Add warm stock one ladle at a time, stirring constantly and allowing each addition to absorb before adding the next, about 18-20 minutes total. Fold in sautéed wild mushrooms, Parmesan, and cold butter. Season and serve immediately with fresh thyme.',
    tags: 'risotto, mushroom, italian, creamy',
    preference: 'vegetarian',
    time: '40 min',
    desc: 'Luxuriously creamy Arborio rice crowned with sautéed wild mushrooms and Parmesan — Italian comfort at its finest.',
    ingredients: ['Arborio rice', 'Wild mushrooms', 'Shallots', 'Garlic', 'White wine', 'Vegetable stock', 'Parmesan', 'Butter', 'Olive oil', 'Thyme', 'Salt', 'Black pepper'],
    region: 'italian',
  },
  {
    idMeal: 'local-043',
    strMeal: 'Saag Paneer',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://www.whiskaffair.com/wp-content/uploads/2020/01/Saag-Paneer-1-3.jpg',
    strInstructions: 'Blanch spinach with a handful of fenugreek leaves; blend to a smooth purée. Shallow-fry paneer cubes until golden; drain. In the same pan, sauté onion, ginger, garlic, and green chili; add tomato and cook until soft. Add the spinach purée, cream, and garam masala; simmer for 10 minutes. Fold in fried paneer and a pat of butter. Serve with paratha.',
    tags: 'saag, spinach, paneer, punjabi',
    preference: 'vegetarian',
    time: '35 min',
    desc: 'Velvet emerald spinach gravy with golden paneer cubes — a rich, creamy Punjabi classic everyone loves.',
    ingredients: ['Paneer', 'Spinach', 'Fenugreek leaves', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Green chili', 'Cream', 'Garam masala', 'Butter', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-044',
    strMeal: 'French Onion Soup',
    strCategory: 'Soups',
    strArea: 'French',
    strMealThumb: 'https://www.familyfoodonthetable.com/wp-content/uploads/2025/01/French-onion-soup-square-1200.jpg',
    strInstructions: 'Slowly caramelize thinly sliced onions in butter over low heat for 45 minutes until deep amber. Deglaze with white wine and cook off. Add vegetable broth, thyme, and bay leaves; simmer for 20 minutes. Ladle soup into oven-safe bowls. Top with toasted baguette slices and a thick layer of grated Gruyère. Broil until the cheese is bubbling and golden-brown. Serve piping hot.',
    tags: 'soup, french, caramelized onion, gruyere',
    preference: 'vegetarian',
    time: '1 hr 20 min',
    desc: 'Deep, sweet caramelized onion broth topped with crusty baguette drowning under bubbling Gruyère.',
    ingredients: ['Onions', 'Butter', 'White wine', 'Vegetable broth', 'Thyme', 'Bay leaves', 'Baguette', 'Gruyère cheese', 'Salt', 'Black pepper'],
    region: 'french',
  },
  {
    idMeal: 'local-045',
    strMeal: 'Upma',
    strCategory: 'Breakfast',
    strArea: 'Indian',
    strMealThumb: 'https://www.honeywhatscooking.com/wp-content/uploads/2023/06/Rava-Upma-FeaturedImage.jpg',
    strInstructions: 'Dry-roast semolina until fragrant and lightly golden; set aside. Heat oil with mustard seeds, chana dal, urad dal, and curry leaves; let them splutter. Add onion, ginger, and green chili; sauté until soft. Add water and bring to a boil. Pour in the roasted semolina while stirring continuously to avoid lumps. Add salt and cover; cook on low for 5 minutes. Garnish with coriander and a squeeze of lemon.',
    tags: 'upma, semolina, breakfast, south indian',
    preference: 'vegetarian',
    time: '20 min',
    desc: 'Fluffy, savory semolina porridge with a nutty tempering and fresh lemon — South India\'s breakfast staple.',
    ingredients: ['Semolina', 'Onion', 'Ginger', 'Green chili', 'Mustard seeds', 'Chana dal', 'Urad dal', 'Curry leaves', 'Lemon juice', 'Fresh coriander', 'Oil', 'Salt'],
    region: 'south-indian',
  },
  {
    idMeal: 'local-046',
    strMeal: 'Greek Spanakopita Triangles',
    strCategory: 'Snacks',
    strArea: 'Greek',
    strMealThumb: 'https://www.mygorgeousrecipes.com/wp-content/uploads/2022/06/Greek-Spanakopita-Triangles-1.jpg',
    strInstructions: 'Mix sautéed spinach (squeezed dry) with feta, ricotta, egg, dill, and nutmeg. Cut phyllo sheets into long strips; brush each with melted butter. Place a teaspoon of filling at one end and fold into triangles by making diagonal folds. Brush tops with butter and bake at 180°C for 20 minutes until golden and crispy. Serve warm as an appetizer.',
    tags: 'greek, phyllo, feta, appetizer',
    preference: 'vegetarian',
    time: '40 min',
    desc: 'Crispy buttery phyllo triangles stuffed with spinach and feta — the perfect party bite or snack.',
    ingredients: ['Phyllo pastry', 'Spinach', 'Feta', 'Ricotta', 'Egg', 'Dill', 'Nutmeg', 'Butter'],
    region: 'greek',
  },
  {
    idMeal: 'local-047',
    strMeal: 'Pav Bhaji',
    strCategory: 'Mains',
    strArea: 'Indian',
    strMealThumb: 'https://assets.bonappetit.com/photos/63cb14735125107865c0fe8f/1:1/w_2560%2Cc_limit/012023-pav-bhaji-lede.jpg',
    strInstructions: 'Boil and mash potatoes, cauliflower, peas, and carrots. Heat butter on a griddle; add onion, capsicum, and ginger-garlic paste; sauté. Add tomatoes and cook until broken down. Add the mashed vegetables, pav bhaji masala, turmeric, and red chili powder; mash everything together and cook for 10 minutes. Slice pav buns and toast cut-side down in butter until golden. Serve bhaji topped with diced onion, coriander, lemon, and a generous knob of butter.',
    tags: 'pav bhaji, street food, mumbai, butter',
    preference: 'vegetarian',
    time: '40 min',
    desc: 'Mumbai\'s legendary buttery spiced vegetable mash with soft toasted bread rolls — pure street-food joy.',
    ingredients: ['Potatoes', 'Cauliflower', 'Peas', 'Carrots', 'Capsicum', 'Onion', 'Tomato', 'Pav bhaji masala', 'Butter', 'Pav buns', 'Fresh coriander', 'Lemon', 'Salt'],
    region: 'maharashtrian',
  },
  {
    idMeal: 'local-048',
    strMeal: 'Tom Kha Hed (Mushroom Coconut Soup)',
    strCategory: 'Soups',
    strArea: 'Thai',
    strMealThumb: 'https://hungryinthailand.com/wp-content/uploads/2024/12/vegan-thai-mushroom-soup-tom-kha.webp',
    strInstructions: 'Simmer coconut milk with vegetable broth, sliced galangal, lemongrass stalks, and kaffir lime leaves for 10 minutes. Add sliced mushrooms (oyster, shiitake, button) and simmer 5 minutes. Season with fish sauce substitute (soy sauce), lime juice, and palm sugar. Add sliced fresh chili and spring onions. Taste and balance salty, sour, sweet. Serve garnished with fresh coriander.',
    tags: 'thai, coconut, mushroom, soup',
    preference: 'vegetarian',
    time: '20 min',
    desc: 'Dreamy, aromatic coconut broth with galangal and mushrooms — Thailand\'s most fragrant soup.',
    ingredients: ['Coconut milk', 'Vegetable broth', 'Galangal', 'Lemongrass', 'Kaffir lime leaves', 'Mixed mushrooms', 'Soy sauce', 'Lime juice', 'Palm sugar', 'Fresh chili', 'Spring onions', 'Fresh coriander'],
    region: 'thai',
  },
  {
    idMeal: 'local-049',
    strMeal: 'Gobi Manchurian',
    strCategory: 'Snacks',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPrEyX7HSUMZu2claQEpUlzmFXiVX7MRoHaQ&s',
    strInstructions: 'Make a thick batter with maida, cornflour, salt, ginger-garlic paste, and soy sauce. Dip cauliflower florets and deep-fry until golden and crispy. In a wok, heat oil and fry ginger, garlic, green chili, and spring onion whites until fragrant. Add soy sauce, chili sauce, ketchup, and vinegar; stir together. Toss in the fried cauliflower and coat well. Garnish with spring onion greens and sesame seeds.',
    tags: 'cauliflower, indo-chinese, crispy, manchurian',
    preference: 'vegetarian',
    time: '35 min',
    desc: 'Crispy cauliflower tossed in a tangy, fiery Indo-Chinese manchurian sauce — addictive street-food bites.',
    ingredients: ['Cauliflower', 'Maida', 'Cornflour', 'Ginger', 'Garlic', 'Green chili', 'Spring onions', 'Soy sauce', 'Chili sauce', 'Ketchup', 'Vinegar', 'Sesame seeds', 'Oil', 'Salt'],
    region: 'indo-chinese',
  },
  {
    idMeal: 'local-050',
    strMeal: 'Beet and Goat Cheese Salad',
    strCategory: 'Salad',
    strArea: 'American',
    strMealThumb: 'https://www.fromachefskitchen.com/wp-content/uploads/2021/05/Roasted-Beet-Salad-with-Walnuts-Goat-Cheese-and-Honey-Balsamic-Dressing-8.jpg',
    strInstructions: 'Roast whole beets wrapped in foil at 200°C for 60 minutes; peel when cool and slice. Whisk together olive oil, balsamic vinegar, Dijon mustard, and honey for the dressing. Arrange arugula and mixed greens on a platter. Top with beet slices, crumbled goat cheese, candied walnuts, and sliced avocado. Drizzle with the dressing and finish with micro herbs.',
    tags: 'salad, beet, goat cheese, roasted',
    preference: 'vegetarian',
    time: '1 hr 10 min',
    desc: 'Jewel-toned roasted beets with creamy goat cheese, candied walnuts, and a tangy balsamic dressing.',
    ingredients: ['Beets', 'Arugula', 'Mixed greens', 'Goat cheese', 'Candied walnuts', 'Avocado', 'Olive oil', 'Balsamic vinegar', 'Dijon mustard', 'Honey', 'Micro herbs'],
    region: 'american',
  },
  {
    idMeal: 'local-051',
    strMeal: 'Pongal',
    strCategory: 'Breakfast',
    strArea: 'Indian',
    strMealThumb: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/05/ven-pongal-recipe.jpg',
    strInstructions: 'Dry-roast moong dal until slightly golden and aromatic. Cook rice and roasted dal together with water and salt until very soft and porridge-like. Heat ghee and fry cashews until golden; add cumin seeds, black pepper, ginger, and curry leaves; sauté for 1 minute. Pour the tempering over the cooked pongal and mix well. Add more ghee and serve hot with sambar and coconut chutney.',
    tags: 'pongal, south indian, breakfast, ghee',
    preference: 'vegetarian',
    time: '30 min',
    desc: 'Creamy rice-and-lentil porridge with a fragrant ghee-pepper tempering — Tamil Nadu\'s breakfast and festival dish.',
    ingredients: ['Rice', 'Moong dal', 'Ghee', 'Cashews', 'Cumin seeds', 'Black pepper', 'Ginger', 'Curry leaves', 'Salt'],
    region: 'south-indian',
  },
  {
    idMeal: 'local-052',
    strMeal: 'Palak Paneer',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://vegecravings.com/wp-content/uploads/2016/12/palak-paneer-recipe-step-by-step-instructions-cover.jpg',
    strInstructions: 'Blanch spinach and blend to a smooth purée. Fry paneer cubes until golden; set aside. Sauté onion, garlic, ginger, and green chili in butter; add tomato and cook until soft. Add the spinach purée, cream, garam masala, and kasoori methi; simmer for 10 minutes. Fold in paneer and adjust seasoning. Serve with naan or jeera rice.',
    tags: 'palak, spinach, paneer, curry',
    preference: 'vegetarian',
    time: '35 min',
    desc: 'Silky spinach gravy enveloping golden paneer — arguably India\'s most loved vegetarian curry.',
    ingredients: ['Spinach', 'Paneer', 'Onion', 'Tomato', 'Garlic', 'Ginger', 'Green chili', 'Cream', 'Garam masala', 'Kasoori methi', 'Butter', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-053',
    strMeal: 'Eggplant Parmesan',
    strCategory: 'Mains',
    strArea: 'Italian',
    strMealThumb: 'https://www.eatingwell.com/thmb/AADqyJzanmxhohPE6ieAi4okuQo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Extra-CrispyEggplantParmesan-Beauty-01-89d65a140a3640e3aba7b80ad8865dba.jpg',
    strInstructions: 'Salt eggplant slices and let rest 30 minutes; pat dry. Dip in flour, beaten egg, and breadcrumbs; shallow-fry until golden. Make a simple marinara by simmering crushed tomatoes with garlic, basil, and olive oil for 20 minutes. Layer fried eggplant, marinara, and mozzarella in a baking dish; repeat. Top with Parmesan and bake at 180°C for 30 minutes until bubbling and golden.',
    tags: 'eggplant, parmesan, italian, baked',
    preference: 'vegetarian',
    time: '1 hr 15 min',
    desc: 'Crispy breaded eggplant layered with marinara and molten mozzarella — Italian vegetarian at its most indulgent.',
    ingredients: ['Eggplant', 'Crushed tomatoes', 'Mozzarella', 'Parmesan', 'Eggs', 'Breadcrumbs', 'Flour', 'Garlic', 'Basil', 'Olive oil', 'Salt'],
    region: 'italian',
  },
  {
    idMeal: 'local-054',
    strMeal: 'Vada Pav',
    strCategory: 'Snacks',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKzOKrpGhIDrArMBAmornbyeiUX6TEyALvtA&s',
    strInstructions: 'Boil and mash potatoes; mix with mustard-seed tempering, curry leaves, green chili, turmeric, and garlic paste. Shape into balls. Prepare a thick batter of besan, turmeric, chili powder, and water. Dip potato balls in batter and deep-fry until golden and crispy. Toast pav buns in butter. Assemble by spreading dry garlic chutney and green chutney on the bun, place the vada inside, and serve with fried green chili.',
    tags: 'vada pav, mumbai, street food, potato',
    preference: 'vegetarian',
    time: '40 min',
    desc: 'Mumbai\'s spicy golden potato fritter in a soft bun with fiery chutneys — the city\'s unofficial burger.',
    ingredients: ['Potatoes', 'Pav buns', 'Besan', 'Mustard seeds', 'Curry leaves', 'Green chili', 'Garlic', 'Turmeric', 'Dry garlic chutney', 'Green chutney', 'Butter', 'Oil'],
    region: 'maharashtrian',
  },
  {
    idMeal: 'local-055',
    strMeal: 'Hummus with Pita',
    strCategory: 'Snacks',
    strArea: 'Middle Eastern',
    strMealThumb: 'https://plantbaes.com/wp-content/uploads/2025/03/Hummus-Pita-Bowl-7.jpg',
    strInstructions: 'Blend boiled or canned chickpeas with ice-cold water, tahini, lemon juice, garlic, and salt in a high-speed blender until completely smooth and creamy. Refrigerate for 30 minutes. Spread in a shallow dish, make a well in the centre, and fill with olive oil, smoked paprika, and a pinch of cumin. Garnish with whole chickpeas and fresh parsley. Serve with warm pita bread.',
    tags: 'hummus, chickpeas, middle eastern, dip',
    preference: 'vegetarian',
    time: '15 min',
    desc: 'Silky-smooth tahini-rich hummus with a swirl of olive oil and paprika — the perfect shareable dip.',
    ingredients: ['Chickpeas', 'Tahini', 'Lemon juice', 'Garlic', 'Ice water', 'Olive oil', 'Smoked paprika', 'Cumin', 'Fresh parsley', 'Pita bread', 'Salt'],
    region: 'middle-eastern',
  },
  {
    idMeal: 'local-056',
    strMeal: 'Dhokla',
    strCategory: 'Snacks',
    strArea: 'Indian',
    strMealThumb: 'https://i0.wp.com/upbeetanisha.com/wp-content/uploads/2023/04/IMG_5343.jpg?w=1200&ssl=1',
    strInstructions: 'Mix besan with yogurt, ginger paste, green chili paste, turmeric, and salt to a smooth batter; rest for 30 minutes. Add eno fruit salt and mix gently. Pour into a greased plate and steam for 15 minutes; test with a toothpick. Heat oil and add mustard seeds, sesame seeds, green chili, and curry leaves; once spluttering, add water and sugar to make the tadka liquid. Pour over steamed dhokla, cut into squares, and garnish with coriander and grated coconut.',
    tags: 'dhokla, gujarati, steamed, snack',
    preference: 'vegetarian',
    time: '50 min',
    desc: 'Soft, spongy fermented chickpea flour cake with a sweet-spicy mustard tempering — Gujarat\'s pride.',
    ingredients: ['Besan', 'Yogurt', 'Ginger paste', 'Green chili paste', 'Turmeric', 'Eno fruit salt', 'Mustard seeds', 'Sesame seeds', 'Curry leaves', 'Sugar', 'Fresh coriander', 'Grated coconut', 'Oil', 'Salt'],
    region: 'gujarati',
  },
  {
    idMeal: 'local-057',
    strMeal: 'Quiche Lorraine (Vegetarian)',
    strCategory: 'Mains',
    strArea: 'French',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnMvXoFyAeA3GNeshCtBuRwahp-vxI8rqsIw&s',
    strInstructions: 'Make shortcrust pastry with flour, butter, and cold water; rest in fridge for 30 minutes. Blind-bake in a tart tin at 180°C for 15 minutes. Sauté leeks and mushrooms in butter until soft. Whisk eggs, cream, Gruyère, salt, pepper, and nutmeg together. Layer the vegetable filling in the pastry shell, pour over the custard, and bake at 160°C for 30-35 minutes until set and golden.',
    tags: 'quiche, french, eggs, pastry',
    preference: 'vegetarian',
    time: '1 hr 20 min',
    desc: 'Golden, creamy custard tart with sautéed leeks and mushrooms in a buttery shortcrust shell — French elegance.',
    ingredients: ['Shortcrust pastry flour', 'Butter', 'Eggs', 'Double cream', 'Gruyère', 'Leeks', 'Mushrooms', 'Nutmeg', 'Salt', 'Black pepper'],
    region: 'french',
  },
  {
    idMeal: 'local-058',
    strMeal: 'Chilli Paneer',
    strCategory: 'Snacks',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8X19_NUorbPHHJePOsUlaCS3fMGrjg77EAA&s',
    strInstructions: 'Cut paneer into cubes; toss in a batter of maida, cornflour, soy sauce, and chili paste; deep-fry until crispy. In a wok, heat oil and stir-fry garlic, ginger, green and red bell peppers, and spring onion whites on high heat for 2 minutes. Add soy sauce, chili sauce, vinegar, and cornflour slurry; toss to make a glossy sauce. Add crispy paneer and coat well. Garnish with spring onion greens.',
    tags: 'paneer, indo-chinese, stir fry, spicy',
    preference: 'vegetarian',
    time: '30 min',
    desc: 'Crispy fried paneer cubes in a tangy, fiery Indo-Chinese chilli sauce — an irresistible starter.',
    ingredients: ['Paneer', 'Maida', 'Cornflour', 'Bell peppers', 'Spring onions', 'Ginger', 'Garlic', 'Soy sauce', 'Chili sauce', 'Vinegar', 'Oil', 'Salt'],
    region: 'indo-chinese',
  },
  {
    idMeal: 'local-059',
    strMeal: 'Tacos de Rajas',
    strCategory: 'Wraps',
    strArea: 'Mexican',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT12h3YAxw40r8ItnZafxqPz4vncUvH959pAA&s',
    strInstructions: 'Roast poblano peppers over a flame until charred; peel, seed, and slice into strips (rajas). Sauté sliced onion in butter until caramelized; add the rajas, corn, and Mexican crema; simmer for 5 minutes until creamy. Season with salt. Warm corn tortillas and fill with the creamy pepper mixture. Top with crumbled queso fresco, fresh epazote, and a squeeze of lime.',
    tags: 'tacos, mexican, poblano, cheese',
    preference: 'vegetarian',
    time: '30 min',
    desc: 'Creamy roasted poblano strips with corn and queso fresco in warm tortillas — Mexican comfort at its finest.',
    ingredients: ['Poblano peppers', 'Corn tortillas', 'Onion', 'Corn', 'Mexican crema', 'Queso fresco', 'Butter', 'Epazote', 'Lime', 'Salt'],
    region: 'mexican',
  },
  {
    idMeal: 'local-060',
    strMeal: 'Beetroot Halwa',
    strCategory: 'Dessert',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvQRrKbTsvUT5dt9YapNo_Pub8whPDeOCzNQ&s',
    strInstructions: 'Grate raw beetroot and cook with milk in a heavy pan on medium heat, stirring frequently, until milk is absorbed. Add sugar and ghee; continue to cook, stirring often, until the mixture leaves the sides of the pan and comes together. Add cardamom powder, chopped nuts, and rose water. Garnish with golden-fried cashews and pistachios. Serve warm or at room temperature.',
    tags: 'halwa, dessert, beetroot, festive',
    preference: 'vegetarian',
    time: '45 min',
    desc: 'Jewel-red beetroot cooked in milk with ghee and cardamom into a gorgeous, fragrant Indian halwa.',
    ingredients: ['Beetroot', 'Milk', 'Sugar', 'Ghee', 'Cardamom powder', 'Rose water', 'Cashews', 'Pistachios'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-061',
    strMeal: 'Omelette du Fromage',
    strCategory: 'Breakfast',
    strArea: 'French',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAqo2KMw4L3eYBW1LN1AFLu8qcvOInESEJgA&s',
    strInstructions: 'Beat eggs with a pinch of salt until smooth. Heat butter in a small non-stick pan over medium heat until foaming subsides. Pour in eggs and stir gently with a spatula while shaking the pan to cook the eggs into very small, soft curds. When eggs are three-quarters set, spread Gruyère evenly over one half. Fold the omelette in thirds, slide onto a plate, and garnish with fresh chives.',
    tags: 'omelette, french, eggs, breakfast',
    preference: 'non-veg',
    time: '10 min',
    desc: 'The perfect French technique omelette — pale, creamy, and rolled around melted Gruyère. Pure mastery.',
    ingredients: ['Eggs', 'Butter', 'Gruyère', 'Fresh chives', 'Salt'],
    region: 'french',
  },
  {
    idMeal: 'local-062',
    strMeal: 'Miso Soup with Tofu',
    strCategory: 'Soups',
    strArea: 'Japanese',
    strMealThumb: 'https://www.crowdedkitchen.com/wp-content/uploads/2020/08/vegan-miso-soup.jpg',
    strInstructions: 'Make dashi by simmering kombu in water for 10 minutes; remove kombu and add katsuobushi (or shiitake for veg version); steep for 5 minutes and strain. Bring dashi to a gentle simmer; dissolve white or red miso paste in a ladleful of dashi before stirring back into the pot. Add silken tofu cubes and wakame seaweed; heat gently without boiling. Serve in bowls garnished with sliced spring onions.',
    tags: 'miso, soup, japanese, tofu',
    preference: 'vegetarian',
    time: '20 min',
    desc: 'Gentle, umami-rich miso broth with silken tofu and wakame — Japan\'s soul-warming daily ritual.',
    ingredients: ['White miso paste', 'Kombu', 'Dried shiitake', 'Silken tofu', 'Wakame seaweed', 'Spring onions', 'Salt'],
    region: 'japanese',
  },
  {
    idMeal: 'local-063',
    strMeal: 'Dal Makhani',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://www.umami.recipes/api/image/recipes/Tc3VqCkMqD1ZhFgkNVw3/images/8N59Tyuz6qBUlgmL3HF0DX?w=3840&q=75',
    strInstructions: 'Soak whole black lentils and kidney beans overnight; pressure cook until very soft. In a heavy pan, melt butter and cook onion, ginger, and garlic paste until golden. Add tomato purée, chili powder, and garam masala; cook until butter separates. Add the cooked lentils and beans; simmer on very low heat for 1 hour, stirring occasionally, adding water as needed. Stir in cream, adjust seasoning, and finish with a pat of butter.',
    tags: 'dal makhani, black lentil, rich, punjabi',
    preference: 'vegetarian',
    time: '2 hrs',
    desc: 'Slow-cooked black lentils in a buttery, creamy tomato gravy — the most indulgent dal you will ever taste.',
    ingredients: ['Whole black lentils', 'Kidney beans', 'Butter', 'Onion', 'Tomato purée', 'Ginger-garlic paste', 'Cream', 'Chili powder', 'Garam masala', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-064',
    strMeal: 'Churros with Chocolate Sauce',
    strCategory: 'Dessert',
    strArea: 'Spanish',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdsVabbroZVoSYLaZUKNL7rQNziHBVZx7P4w&s',
    strInstructions: 'Boil water with butter, sugar, and salt; add flour all at once and beat vigorously until a smooth dough forms that leaves the sides of the pan. Cool slightly, then beat in eggs one at a time. Pipe the dough through a star-tip nozzle directly into hot oil; fry until golden and cooked through. Drain and roll immediately in cinnamon sugar. For the sauce, melt dark chocolate with cream and a pinch of salt, stirring until glossy. Serve churros warm with the dipping sauce.',
    tags: 'churros, spanish, dessert, chocolate',
    preference: 'vegetarian',
    time: '40 min',
    desc: 'Crispy cinnamon-sugar ridged dough sticks dunked into thick, velvety dark chocolate sauce — pure bliss.',
    ingredients: ['Flour', 'Butter', 'Eggs', 'Sugar', 'Salt', 'Cinnamon', 'Dark chocolate', 'Heavy cream', 'Oil'],
    region: 'spanish',
  },
  {
    idMeal: 'local-065',
    strMeal: 'Gajar Ka Halwa',
    strCategory: 'Dessert',
    strArea: 'Indian',
    strMealThumb: 'https://www.shutterstock.com/image-photo/gajar-ka-halwa-carrotbased-sweet-600nw-759925072.jpg',
    strInstructions: 'Grate fresh red carrots and cook them in full-fat milk in a heavy kadai, stirring regularly, until milk is absorbed completely. Add sugar and ghee; stir and cook until the mixture thickens and ghee begins to separate. Add cardamom powder and khoya; mix well and cook for 5 more minutes. Garnish with golden-fried cashews, almonds, and pistachios. Serve hot.',
    tags: 'carrot halwa, dessert, winter, festive',
    preference: 'vegetarian',
    time: '1 hr',
    desc: 'Sweet, fragrant carrot halwa slow-cooked in milk with ghee, cardamom, and khoya — winter\'s greatest dessert.',
    ingredients: ['Red carrots', 'Full-fat milk', 'Sugar', 'Ghee', 'Khoya', 'Cardamom powder', 'Cashews', 'Almonds', 'Pistachios'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-066',
    strMeal: 'Chili Cheese Toast',
    strCategory: 'Breakfast',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3MsipYbifhf3XNL1Uhba51bZSbrxIMlr0FA&s',
    strInstructions: 'Mix grated processed cheese and mozzarella with finely chopped onion, green chili, bell pepper, coriander, and black pepper. Spread butter on bread slices. Top generously with the cheese mixture and press down lightly. Grill or broil until the cheese melts, bubbles, and turns golden in spots. Serve immediately with ketchup or hot sauce.',
    tags: 'toast, cheese, snack, quick',
    preference: 'vegetarian',
    time: '15 min',
    desc: 'Melted, bubbling cheese loaded with green chili and peppers on toasted bread — the ultimate quick snack.',
    ingredients: ['Bread slices', 'Processed cheese', 'Mozzarella', 'Onion', 'Green chili', 'Bell pepper', 'Fresh coriander', 'Black pepper', 'Butter'],
    region: 'indian',
  },
  {
    idMeal: 'local-067',
    strMeal: 'Vegetarian Moussaka',
    strCategory: 'Mains',
    strArea: 'Greek',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGHJ-C-qB9L3txBbbQ0nAzG8M4DxjKwf6iKA&s',
    strInstructions: 'Slice and roast eggplant with olive oil until golden. Make a lentil sauce by cooking green lentils with onion, garlic, canned tomatoes, cinnamon, allspice, and red wine. Make a béchamel with butter, flour, milk, Parmesan, egg yolks, and nutmeg. Layer a baking dish with eggplant, lentil sauce, eggplant again, and top with béchamel. Bake at 180°C for 45 minutes until the top is set and golden.',
    tags: 'moussaka, greek, eggplant, bechamel',
    preference: 'vegetarian',
    time: '1 hr 30 min',
    desc: 'Layers of roasted eggplant and spiced lentil sauce topped with velvety béchamel — Greek comfort reimagined.',
    ingredients: ['Eggplant', 'Green lentils', 'Onion', 'Garlic', 'Canned tomatoes', 'Cinnamon', 'Allspice', 'Red wine', 'Butter', 'Flour', 'Milk', 'Parmesan', 'Eggs', 'Nutmeg', 'Olive oil'],
    region: 'greek',
  },
  {
    idMeal: 'local-068',
    strMeal: 'Paneer Bhurji',
    strCategory: 'Breakfast',
    strArea: 'Indian',
    strMealThumb: 'https://www.easycookingwithmolly.com/wp-content/uploads/2021/09/dhaba-style-paneer-bhurji-recipe.jpg',
    strInstructions: 'Heat oil and sauté cumin seeds, onion, ginger, and green chili until golden. Add bell pepper and cook for 2 minutes. Stir in tomatoes, turmeric, chili powder, and garam masala; cook until the oil separates. Crumble paneer into the pan and mix well; cook for 3-4 minutes until heated through. Finish with fresh coriander and a squeeze of lemon. Serve with paratha or pav.',
    tags: 'paneer, scramble, breakfast, quick',
    preference: 'vegetarian',
    time: '20 min',
    desc: 'Spiced scrambled paneer with onions, peppers, and tomatoes — a protein-rich North Indian breakfast favourite.',
    ingredients: ['Paneer', 'Onion', 'Tomato', 'Bell pepper', 'Ginger', 'Green chili', 'Cumin seeds', 'Turmeric', 'Chili powder', 'Garam masala', 'Fresh coriander', 'Lemon', 'Oil'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-069',
    strMeal: 'Tiramisu',
    strCategory: 'Dessert',
    strArea: 'Italian',
    strMealThumb: 'https://static01.nyt.com/images/2017/04/05/dining/05COOKING-TIRAMISU1/05COOKING-TIRAMISU1-jumbo-v2.jpg',
    strInstructions: 'Beat egg yolks with sugar until pale and thick; fold in mascarpone until smooth. Whip egg whites to stiff peaks and gently fold into the mascarpone mixture. Dip savoiardi biscuits briefly in strong espresso mixed with coffee liqueur; layer in a dish. Spread half the mascarpone cream, add another layer of soaked biscuits, then remaining cream. Refrigerate for 6 hours or overnight. Dust generously with cocoa powder before serving.',
    tags: 'tiramisu, italian, dessert, coffee',
    preference: 'vegetarian',
    time: '30 min + chill',
    desc: 'The iconic Italian pick-me-up — espresso-soaked ladyfingers layered with silky mascarpone and dusted with cocoa.',
    ingredients: ['Savoiardi biscuits', 'Mascarpone', 'Eggs', 'Sugar', 'Espresso', 'Coffee liqueur', 'Cocoa powder'],
    region: 'italian',
  },
  {
    idMeal: 'local-070',
    strMeal: 'Okonomiyaki',
    strCategory: 'Mains',
    strArea: 'Japanese',
    strMealThumb: 'https://images.squarespace-cdn.com/content/v1/5fcb6dce261ace71683d20ab/1622187997262-WLRIIJQHT2L8R7U4OF49/okonomiyaki1.jpg',
    strInstructions: 'Whisk flour, dashi stock, eggs, and soy sauce into a batter. Fold in finely shredded cabbage, sliced spring onions, and tenkasu (tempura flakes). Heat oil in a pan and pour in a ladleful of batter; cook for 4-5 minutes each side until cooked through and golden. Drizzle with Kewpie mayo and okonomiyaki sauce in zigzag patterns. Top with aonori seaweed powder and bonito flakes (optional).',
    tags: 'okonomiyaki, japanese, pancake, savory',
    preference: 'vegetarian',
    time: '30 min',
    desc: 'Japanese savory cabbage pancake with tangy sauce and mayo — Osaka\'s beloved street-food comfort dish.',
    ingredients: ['Flour', 'Dashi stock', 'Eggs', 'Soy sauce', 'Cabbage', 'Spring onions', 'Tenkasu', 'Kewpie mayo', 'Okonomiyaki sauce', 'Aonori', 'Oil'],
    region: 'japanese',
  },
  {
    idMeal: 'local-071',
    strMeal: 'Cheela (Moong Dal Pancakes)',
    strCategory: 'Breakfast',
    strArea: 'Indian',
    strMealThumb: 'https://www.thespruceeats.com/thmb/XId3CmSQpXs8n4nTYt0R-wWSb-o=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/MoongDalCheela-GettyImages-625411394-5add6950c5542e0036e3d9e1.jpg',
    strInstructions: 'Soak moong dal for 3 hours; blend with ginger, green chili, cumin, and water to a smooth pourable batter. Add finely chopped onion, coriander, and salt. Heat a non-stick tawa and grease lightly; pour a ladle of batter and spread in a circle. Drizzle oil around the edges; cook for 2-3 minutes until the top is set, then flip and cook the other side. Serve with green chutney and yogurt.',
    tags: 'cheela, pancake, moong dal, breakfast',
    preference: 'vegetarian',
    time: '3 hrs + 20 min',
    desc: 'Thin, crispy moong dal pancakes packed with protein — a light and nutritious North Indian breakfast.',
    ingredients: ['Moong dal', 'Ginger', 'Green chili', 'Cumin', 'Onion', 'Fresh coriander', 'Salt', 'Oil', 'Green chutney', 'Yogurt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-072',
    strMeal: 'Borscht',
    strCategory: 'Soups',
    strArea: 'Eastern European',
    strMealThumb: 'https://www.simplyrecipes.com/thmb/gO9TkN3MfFo6gWoB27TQn-vvkyc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__simply_recipes__uploads__2007__12__borscht-horiz-c-1800-ec20c28c577248739a38ddd6658c2c94.jpg',
    strInstructions: 'Sauté onion, carrots, and celery in butter until soft. Add shredded raw beet and cook for 5 minutes. Pour in vegetable broth, diced potatoes, and canned tomatoes; bring to a boil and simmer for 25 minutes. Add shredded cabbage and cook 10 more minutes. Stir in red wine vinegar, sugar, and fresh dill; adjust seasoning. Serve topped with a generous dollop of sour cream and more dill.',
    tags: 'borscht, beet, soup, eastern european',
    preference: 'vegetarian',
    time: '55 min',
    desc: 'Vibrant crimson beet and cabbage soup with a sour cream swirl — Eastern Europe\'s most iconic bowl.',
    ingredients: ['Beets', 'Cabbage', 'Potatoes', 'Carrots', 'Onion', 'Celery', 'Vegetable broth', 'Canned tomatoes', 'Red wine vinegar', 'Sugar', 'Fresh dill', 'Sour cream', 'Butter', 'Salt'],
    region: 'eastern-european',
  },
  {
    idMeal: 'local-073',
    strMeal: 'Aloo Paratha',
    strCategory: 'Breakfast',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9qZCiqFPYEuwQzItBtE_alFqFBhRhrzpE5Q&s',
    strInstructions: 'Boil and mash potatoes with green chili, coriander, garam masala, amchur, and salt. Make a soft whole-wheat dough. Roll a dough ball into a small circle, place a ball of potato filling in the centre, bring edges together and seal. Gently roll out into a flat paratha. Cook on a hot tawa, flipping twice, applying ghee or butter generously on both sides until golden and cooked. Serve with yogurt, butter, and pickle.',
    tags: 'paratha, potato, punjabi, breakfast',
    preference: 'vegetarian',
    time: '40 min',
    desc: 'Flaky whole-wheat flatbread stuffed with spiced mashed potato, fried in ghee — Punjab\'s ultimate breakfast.',
    ingredients: ['Whole wheat flour', 'Potatoes', 'Green chili', 'Fresh coriander', 'Garam masala', 'Amchur', 'Ghee', 'Yogurt', 'Pickle', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-074',
    strMeal: 'Panzanella',
    strCategory: 'Salad',
    strArea: 'Italian',
    strMealThumb: 'https://images.immediate.co.uk/production/volatile/sites/30/2025/05/BBQ-peach-panzanella-e7637c1.jpg?quality=90&resize=556,505',
    strInstructions: 'Tear stale ciabatta into chunks and toast in olive oil until golden and crispy. Combine ripe tomatoes, cucumber, red onion (soaked in water to soften), capers, and torn basil. Make a dressing with red wine vinegar, extra-virgin olive oil, garlic, salt, and pepper. Toss the bread with the vegetables and dressing; let stand for 20 minutes so the bread can absorb the juices. Serve at room temperature.',
    tags: 'panzanella, italian, bread salad, tomato',
    preference: 'vegetarian',
    time: '30 min',
    desc: 'Tuscan bread salad with ripe tomatoes, capers, and basil — the most delicious use of day-old bread.',
    ingredients: ['Stale ciabatta', 'Ripe tomatoes', 'Cucumber', 'Red onion', 'Capers', 'Fresh basil', 'Red wine vinegar', 'Extra-virgin olive oil', 'Garlic', 'Salt', 'Black pepper'],
    region: 'italian',
  },
  {
    idMeal: 'local-075',
    strMeal: 'Paneer Lababdar',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://media-cdn.tripadvisor.com/media/photo-s/28/d2/2a/a8/paneer-lababdar-soft.jpg',
    strInstructions: 'Blend roasted tomatoes, onions, cashews, and red chilies into a smooth purée. Cook the purée in butter until deeply colored and oil separates. Add ginger julienne, kashmiri chili, coriander powder, and salt. Stir in cream and a little water for consistency; simmer for 10 minutes. Add cubed paneer and kasuri methi; cook gently for 5 minutes. Finish with a butter knob and serve with butter naan.',
    tags: 'paneer, lababdar, rich, creamy',
    preference: 'vegetarian',
    time: '45 min',
    desc: 'Rich, indulgent paneer in a deeply flavored cashew-tomato cream sauce — restaurant-style luxury at home.',
    ingredients: ['Paneer', 'Tomatoes', 'Onion', 'Cashews', 'Red chili', 'Kashmiri chili', 'Cream', 'Butter', 'Ginger', 'Kasuri methi', 'Coriander powder', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-076',
    strMeal: 'Crepes Suzette',
    strCategory: 'Dessert',
    strArea: 'French',
    strMealThumb: 'https://www.allrecipes.com/thmb/nkBoZAGeZD-kvKHeDiRF_mZnmzM=/0x512/filters:no_upscale():max_bytes(150000):strip_icc()/ALR-crepes-suzette-recipe-8647003-VAT-B-4x3-414d093bbcaf4868a9e598abd8163151.jpg',
    strInstructions: 'Make thin crêpes with flour, eggs, milk, butter, and a pinch of salt; cook until golden on both sides. For the sauce, melt butter and sugar in a wide pan until caramel forms; add orange zest, orange juice, and Grand Marnier; stir to combine. Fold crêpes into quarters and warm them in the sauce. Drizzle with additional Grand Marnier and flambé tableside. Serve immediately with vanilla ice cream.',
    tags: 'crepes, french, orange, flambe',
    preference: 'vegetarian',
    time: '45 min',
    desc: 'Delicate butter crêpes folded in a blazing caramelized orange sauce — the most theatrical French dessert.',
    ingredients: ['Flour', 'Eggs', 'Milk', 'Butter', 'Sugar', 'Orange zest', 'Orange juice', 'Grand Marnier', 'Salt', 'Vanilla ice cream'],
    region: 'french',
  },

  // ─────────────────────────────────────────────
  // 50 NON-VEG RECIPES  (local-077 … local-126)
  // ─────────────────────────────────────────────
  {
    idMeal: 'local-077',
    strMeal: 'Butter Chicken',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlnMiH3krLUHV9K5eZpzSgrV4FG96IzUMtnw&s',
    strInstructions: 'Marinate chicken in yogurt, lemon juice, and tikka spices for 2 hours; grill or broil until charred. Make the makhani sauce by cooking onion, tomatoes, ginger-garlic paste, cashew paste, cream, butter, and spices until rich and deep red. Blend until smooth; simmer for 15 minutes. Add the grilled chicken pieces; simmer for 10 more minutes until coated. Finish with cream and a knob of butter.',
    tags: 'butter chicken, curry, makhani, punjabi',
    preference: 'non-veg',
    time: '1 hr + marinate',
    desc: 'The world\'s most beloved curry — smoky tandoor chicken in a luscious buttery tomato cream sauce.',
    ingredients: ['Chicken', 'Yogurt', 'Tikka spice mix', 'Tomatoes', 'Onion', 'Ginger-garlic paste', 'Cashew paste', 'Heavy cream', 'Butter', 'Lemon juice', 'Garam masala', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-078',
    strMeal: 'Spaghetti Bolognese',
    strCategory: 'Pasta',
    strArea: 'Italian',
    strMealThumb: 'https://t3.ftcdn.net/jpg/01/09/75/90/360_F_109759077_SVp62TBuHkSn3UsGW4dBOm9R0ALVetYw.jpg',
    strInstructions: 'Sauté diced onion, carrot, and celery in olive oil and butter until soft. Add ground beef and cook until browned. Pour in red wine and reduce. Add crushed tomatoes, tomato paste, milk, nutmeg, and a bouquet of herbs. Simmer on very low heat for 2 hours, stirring occasionally. Cook spaghetti al dente and toss with the meat sauce. Serve with generous Parmesan and fresh basil.',
    tags: 'bolognese, pasta, italian, beef',
    preference: 'non-veg',
    time: '2 hrs 30 min',
    desc: 'The authentic Bolognese — slow-cooked ground beef and vegetable ragù clinging to every strand of spaghetti.',
    ingredients: ['Spaghetti', 'Ground beef', 'Onion', 'Carrot', 'Celery', 'Red wine', 'Crushed tomatoes', 'Tomato paste', 'Milk', 'Parmesan', 'Olive oil', 'Butter', 'Nutmeg', 'Fresh basil', 'Salt'],
    region: 'italian',
  },
  {
    idMeal: 'local-079',
    strMeal: 'Chicken Biryani',
    strCategory: 'Rice',
    strArea: 'Indian',
    strMealThumb: 'https://static.vecteezy.com/system/resources/previews/067/290/979/large_2x/crispy-chicken-biryanigraphy-served-in-classic-indian-plate-style-photo.jpg',
    strInstructions: 'Marinate chicken pieces with yogurt, biryani masala, ginger-garlic paste, chili powder, and lemon juice for 1 hour. Parboil basmati rice with whole spices until 70% cooked. Layer a heavy pot with half the rice, then marinated chicken, caramelized onions, saffron milk, fried onions, mint, and remaining rice. Seal with dough or foil and cook on dum for 40 minutes on low heat. Mix gently and serve with raita.',
    tags: 'biryani, chicken, rice, dum cooking',
    preference: 'non-veg',
    time: '2 hrs',
    desc: 'Fragrant dum-cooked chicken biryani layered with saffron rice, fried onions, and fresh mint — celebration in a pot.',
    ingredients: ['Chicken', 'Basmati rice', 'Yogurt', 'Biryani masala', 'Ginger-garlic paste', 'Caramelized onions', 'Saffron', 'Mint', 'Whole spices', 'Lemon juice', 'Oil', 'Salt'],
    region: 'hyderabadi',
  },
  {
    idMeal: 'local-080',
    strMeal: 'Prawn Masala',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR-Lo-imqZOMAWkacJ18guHYUCudBZqK7GCA&s',
    strInstructions: 'Clean and devein prawns; marinate with turmeric, chili powder, and salt for 15 minutes. Fry onion until golden, add ginger-garlic paste, tomatoes, and masalas (coriander, cumin, garam masala, and chili); cook until oil separates. Add marinated prawns and cook on medium heat for 6-8 minutes until curled and coated. Finish with fresh coriander, curry leaves, and a squeeze of lemon.',
    tags: 'prawns, curry, seafood, coastal',
    preference: 'non-veg',
    time: '35 min',
    desc: 'Juicy prawns in a bold, spiced onion-tomato masala — a coastal Indian seafood classic with serious depth.',
    ingredients: ['Prawns', 'Onion', 'Tomato', 'Ginger-garlic paste', 'Turmeric', 'Chili powder', 'Coriander powder', 'Cumin powder', 'Garam masala', 'Curry leaves', 'Fresh coriander', 'Lemon', 'Oil', 'Salt'],
    region: 'south-indian',
  },
  {
    idMeal: 'local-081',
    strMeal: 'Peking Duck',
    strCategory: 'Mains',
    strArea: 'Chinese',
    strMealThumb: 'https://www.allrecipes.com/thmb/I7mLbsFOCOSkEIyYgIa1QT89tzQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/AR-31972-peking-duck-DDMFS-4x3-hero-3344139da66141b687e1d7b85b995bf5.jpg',
    strInstructions: 'Rub the whole duck with a mixture of five-spice, soy sauce, honey, and Shaoxing wine; hang or rest uncovered in the fridge for 24 hours to dry the skin. Roast at 200°C, breast-side down, for 30 minutes, then flip and roast 30 more minutes. Increase heat to 220°C and glaze with hoisin-honey mixture; roast another 15 minutes until lacquered and mahogany. Slice thinly and serve in Mandarin pancakes with cucumber, spring onions, and hoisin sauce.',
    tags: 'duck, chinese, roasted, peking',
    preference: 'non-veg',
    time: '24 hrs + 1.5 hrs',
    desc: 'Lacquered crispy-skin duck served with pancakes, hoisin, and spring onion — Beijing\'s most regal dish.',
    ingredients: ['Whole duck', 'Five-spice', 'Soy sauce', 'Honey', 'Hoisin sauce', 'Shaoxing wine', 'Mandarin pancakes', 'Cucumber', 'Spring onions'],
    region: 'chinese',
  },
  {
    idMeal: 'local-082',
    strMeal: 'Chicken Tikka',
    strCategory: 'Starters',
    strArea: 'Indian',
    strMealThumb: 'https://images.pexels.com/photos/29173114/pexels-photo-29173114.jpeg?cs=srgb&dl=pexels-kunal-lakhotia-781256899-29173114.jpg&fm=jpg',
    strInstructions: 'Cut boneless chicken into cubes. Marinate in thick yogurt, ginger-garlic paste, kashmiri chili powder, cumin, coriander, garam masala, lemon juice, and oil for at least 2 hours. Thread onto skewers and grill or broil at high heat for 10-12 minutes, turning once, until lightly charred. Baste with butter during cooking. Serve with mint-coriander chutney, sliced onions, and lemon wedges.',
    tags: 'tikka, chicken, grilled, starter',
    preference: 'non-veg',
    time: '2 hrs + 20 min',
    desc: 'Tender marinated chicken cubes with a smoky char from the grill — the irresistible foundation of tandoori cooking.',
    ingredients: ['Boneless chicken', 'Yogurt', 'Ginger-garlic paste', 'Kashmiri chili powder', 'Cumin', 'Coriander', 'Garam masala', 'Lemon juice', 'Butter', 'Oil', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-083',
    strMeal: 'Fish and Chips',
    strCategory: 'Mains',
    strArea: 'British',
    strMealThumb: 'https://t3.ftcdn.net/jpg/09/05/36/24/360_F_905362434_cymoaK9Vvr1t8OjNa915qhB7MDzLv3ot.jpg',
    strInstructions: 'Cut thick chips from Maris Piper potatoes; par-boil, then dry and double-fry: first at 160°C until cooked, then at 190°C until crispy. Make a batter with self-raising flour, ice-cold beer, and salt. Dip cod fillets in seasoned flour, then batter, and fry in hot oil at 180°C for 5-7 minutes until golden and crispy. Drain and season immediately with salt. Serve with chips, mushy peas, tartare sauce, and malt vinegar.',
    tags: 'fish, british, battered, cod',
    preference: 'non-veg',
    time: '50 min',
    desc: 'Crispy golden battered cod with double-fried chips — Britain\'s greatest contribution to world cuisine.',
    ingredients: ['Cod fillets', 'Maris Piper potatoes', 'Self-raising flour', 'Beer', 'Mushy peas', 'Tartare sauce', 'Malt vinegar', 'Oil', 'Salt'],
    region: 'british',
  },
  {
    idMeal: 'local-084',
    strMeal: 'Mutton Rogan Josh',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK8ujHfTpL3DwS6fnt2Ulm77_2Zj12tuzPDw&s',
    strInstructions: 'Brown mutton pieces in hot oil and set aside. In the same oil, fry whole spices (cloves, cardamom, cinnamon) then add onion paste and cook until golden. Add ginger-garlic paste, Kashmiri chili powder (for color), and yogurt; cook until oil separates. Add browned mutton, fried onion paste, and a little water; cook covered on low heat for 1.5 hours until mutton is tender. Finish with garam masala and fresh coriander.',
    tags: 'rogan josh, mutton, kashmiri, slow cooked',
    preference: 'non-veg',
    time: '2 hrs',
    desc: 'Fall-off-the-bone mutton in a vibrant Kashmiri chili gravy with aromatic whole spices — Kashmir\'s treasure.',
    ingredients: ['Mutton', 'Onion', 'Yogurt', 'Ginger-garlic paste', 'Kashmiri chili powder', 'Cardamom', 'Cloves', 'Cinnamon', 'Garam masala', 'Fresh coriander', 'Oil', 'Salt'],
    region: 'kashmiri',
  },
  {
    idMeal: 'local-085',
    strMeal: 'Pad Kra Pao (Thai Basil Chicken)',
    strCategory: 'Mains',
    strArea: 'Thai',
    strMealThumb: 'https://migrationology.smugmug.com/Thai-Recipes/i-S5pmbsQ/0/X3/thai-chicken-basil-recipe-4-X3.jpg',
    strInstructions: 'Heat oil in a wok on very high heat. Fry sliced garlic and bird\'s eye chilies until fragrant. Add ground chicken and stir-fry, breaking it up, until cooked and caramelized. Season with oyster sauce, soy sauce, fish sauce, and a pinch of sugar; toss together. Remove from heat and stir in a massive handful of fresh Thai holy basil leaves. Serve over jasmine rice topped with a crispy fried egg.',
    tags: 'thai, chicken, basil, stir-fry',
    preference: 'non-veg',
    time: '15 min',
    desc: 'Fiery wok-charred minced chicken and holy basil over rice with a crispy egg — Thailand\'s greatest weeknight dish.',
    ingredients: ['Ground chicken', 'Thai holy basil', 'Garlic', 'Bird\'s eye chili', 'Oyster sauce', 'Soy sauce', 'Fish sauce', 'Sugar', 'Eggs', 'Jasmine rice', 'Oil'],
    region: 'thai',
  },
  {
    idMeal: 'local-086',
    strMeal: 'Beef Tacos',
    strCategory: 'Wraps',
    strArea: 'Mexican',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSV2EaV2de1pkMmUTGXk2K2WC7WEyFNvGSPQ&s',
    strInstructions: 'Brown ground beef in a hot skillet; drain excess fat. Season with taco seasoning (cumin, chili powder, garlic powder, oregano), a splash of beef broth, and salt; simmer for 5 minutes. Warm corn tortillas on a dry skillet. Fill each tortilla with seasoned beef, shredded lettuce, diced tomato, shredded cheddar, sour cream, and sliced jalapeños. Finish with a squeeze of fresh lime.',
    tags: 'tacos, mexican, beef, street food',
    preference: 'non-veg',
    time: '20 min',
    desc: 'Seasoned spiced ground beef in warm tortillas loaded with fresh toppings — the taco everyone craves.',
    ingredients: ['Ground beef', 'Corn tortillas', 'Taco seasoning', 'Beef broth', 'Shredded lettuce', 'Tomato', 'Cheddar cheese', 'Sour cream', 'Jalapeños', 'Lime', 'Salt'],
    region: 'mexican',
  },
  {
    idMeal: 'local-087',
    strMeal: 'Lamb Kofta Kebabs',
    strCategory: 'Starters',
    strArea: 'Middle Eastern',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeueAKHrea-NuxykoiyOuZqXZ79J5hzdvDJw&s',
    strInstructions: 'Mix ground lamb with finely grated onion, garlic, parsley, cumin, coriander, cinnamon, and allspice. Season well with salt and pepper. Divide into portions and mold each around a flat skewer in a sausage shape. Grill over high heat for 8-10 minutes, turning to cook evenly. Serve tucked into warm pita with sliced tomato, red onion, cucumber, and a generous drizzle of tahini.',
    tags: 'kofta, lamb, kebab, middle eastern',
    preference: 'non-veg',
    time: '30 min',
    desc: 'Spiced ground lamb molded on skewers and grilled to smoky perfection — served with pita and tahini.',
    ingredients: ['Ground lamb', 'Onion', 'Garlic', 'Parsley', 'Cumin', 'Coriander', 'Cinnamon', 'Allspice', 'Pita bread', 'Tomato', 'Red onion', 'Cucumber', 'Tahini', 'Salt', 'Black pepper'],
    region: 'middle-eastern',
  },
  {
    idMeal: 'local-088',
    strMeal: 'Chicken 65',
    strCategory: 'Starters',
    strArea: 'Indian',
    strMealThumb: 'https://t3.ftcdn.net/jpg/16/00/18/10/360_F_1600181037_6afxO52nIDCJeo1hxvpQ7Ozfn1g19Kaz.jpg',
    strInstructions: 'Cut chicken into small cubes. Marinate with ginger-garlic paste, red chili powder, turmeric, curd, cornflour, egg, and salt for 1 hour. Deep-fry in batches until crispy and red. For the tempering, fry curry leaves, green chili, and dry red chili in oil; add the fried chicken, a squeeze of lemon juice, and chaat masala. Toss and serve immediately garnished with coriander and lime.',
    tags: 'chicken 65, south indian, fried, spicy',
    preference: 'non-veg',
    time: '1 hr 20 min',
    desc: 'India\'s most iconic spicy fried chicken bites — fiery red, intensely flavored, and dangerously addictive.',
    ingredients: ['Chicken', 'Ginger-garlic paste', 'Red chili powder', 'Turmeric', 'Yogurt', 'Cornflour', 'Egg', 'Curry leaves', 'Green chili', 'Chaat masala', 'Lemon juice', 'Oil', 'Salt'],
    region: 'south-indian',
  },
  {
    idMeal: 'local-089',
    strMeal: 'Salmon Teriyaki',
    strCategory: 'Mains',
    strArea: 'Japanese',
    strMealThumb: 'https://hillstreetgrocer.com/application/files/7415/3992/1571/teriyaki_salmon.jpg',
    strInstructions: 'Mix soy sauce, mirin, sake, and sugar in a small pan; simmer until slightly thickened to make teriyaki sauce. Pat salmon fillets dry and score the skin. Heat oil in a pan and cook skin-side down for 4 minutes until crispy; flip and cook 2 more minutes. Pour the teriyaki sauce over the salmon and cook 1 minute, basting continuously, until glazed. Serve over steamed rice with steamed edamame and garnish with sesame seeds and spring onion.',
    tags: 'salmon, teriyaki, japanese, glazed',
    preference: 'non-veg',
    time: '20 min',
    desc: 'Pan-seared salmon with crispy skin glazed in sweet soy teriyaki — Japanese-style simplicity at its finest.',
    ingredients: ['Salmon fillets', 'Soy sauce', 'Mirin', 'Sake', 'Sugar', 'Sesame seeds', 'Spring onions', 'Steamed rice', 'Edamame', 'Oil'],
    region: 'japanese',
  },
  {
    idMeal: 'local-090',
    strMeal: 'Chicken Shawarma',
    strCategory: 'Wraps',
    strArea: 'Middle Eastern',
    strMealThumb: 'https://www.shutterstock.com/image-photo/chicken-shawarma-roll-middle-eastern-600nw-2639621351.jpg',
    strInstructions: 'Marinate chicken thighs in yogurt, lemon juice, garlic, cumin, coriander, turmeric, paprika, and cinnamon for 4 hours. Grill or bake at 220°C until cooked and charred. Rest and slice thinly. Make garlic sauce (toum) by blending garlic, lemon juice, salt, and oil into a fluffy emulsion. Wrap sliced chicken in pita with garlic sauce, pickled turnip, sliced tomato, and parsley.',
    tags: 'shawarma, chicken, middle eastern, wrap',
    preference: 'non-veg',
    time: '4 hrs + 30 min',
    desc: 'Spice-marinated chicken piled into pita with fluffy garlic sauce and pickles — the shawarma of your dreams.',
    ingredients: ['Chicken thighs', 'Yogurt', 'Lemon juice', 'Garlic', 'Cumin', 'Coriander', 'Turmeric', 'Paprika', 'Cinnamon', 'Pita bread', 'Pickled turnip', 'Tomato', 'Parsley', 'Oil', 'Salt'],
    region: 'middle-eastern',
  },
  {
    idMeal: 'local-091',
    strMeal: 'Goan Fish Curry',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://www.recipetineats.com/tachyon/2020/10/Goan-Fish-Curry_6-SQ.jpg',
    strInstructions: 'Blend dried red Kashmiri chilies, fresh grated coconut, coriander seeds, cumin, turmeric, garlic, and ginger with water to make a smooth masala paste. Sauté onion in oil until translucent; add the masala paste and cook for 5 minutes. Pour in coconut milk and tamarind water; bring to a simmer. Add fish pieces (king mackerel or pomfret) and cook gently for 8-10 minutes. Finish with raw mango slices and serve with steamed rice.',
    tags: 'goan, fish, coconut curry, seafood',
    preference: 'non-veg',
    time: '35 min',
    desc: 'Tangy coconut fish curry with a fiery red chili masala — Goa\'s most soul-satisfying seafood dish.',
    ingredients: ['Fish (king mackerel or pomfret)', 'Coconut milk', 'Dried red chilies', 'Grated coconut', 'Tamarind', 'Onion', 'Garlic', 'Ginger', 'Coriander seeds', 'Cumin', 'Turmeric', 'Raw mango', 'Oil', 'Salt'],
    region: 'goan',
  },
  {
    idMeal: 'local-092',
    strMeal: 'Coq au Vin',
    strCategory: 'Mains',
    strArea: 'French',
    strMealThumb: 'https://images.services.kitchenstories.io/9GIeqQwpeGj8Te6zRGt07XzEETo=/3840x0/filters:quality(80)/images.kitchenstories.io/wagtailOriginalImages/R23-final-photo-4.jpg',
    strInstructions: 'Season and brown chicken pieces in a Dutch oven with bacon lardons. Remove chicken; sauté pearl onions and mushrooms in the same pan. Return chicken and bacon; pour in red wine (Burgundy) and chicken stock to just cover. Add thyme, bay leaf, and garlic; bring to a simmer. Cook covered for 1 hour until chicken is very tender. Make a beurre manié to thicken the sauce if needed; adjust seasoning and serve with crusty bread or egg noodles.',
    tags: 'coq au vin, french, chicken, red wine',
    preference: 'non-veg',
    time: '1 hr 30 min',
    desc: 'Slow-braised chicken in a rich Burgundy wine sauce with pearl onions and mushrooms — French countryside perfection.',
    ingredients: ['Chicken', 'Bacon lardons', 'Red wine', 'Chicken stock', 'Pearl onions', 'Mushrooms', 'Garlic', 'Thyme', 'Bay leaf', 'Butter', 'Flour', 'Salt', 'Black pepper'],
    region: 'french',
  },
  {
    idMeal: 'local-093',
    strMeal: 'Mutton Haleem',
    strCategory: 'Mains',
    strArea: 'Indian',
    strMealThumb: 'https://www.licious.in/blog/wp-content/uploads/2022/04/Mutton-Haleem-Cooked-min-compressed-1-scaled.jpg',
    strInstructions: 'Soak wheat, chana dal, moong dal, masoor dal, and barley overnight. Cook with mutton, whole spices, ginger-garlic paste, and water in a pressure cooker until everything is very soft. Remove mutton, shred finely. Blend the lentil-grain mixture until half smooth. Return shredded mutton and simmer with fried onions, biryani masala, ghee, and more water for 30 minutes, stirring constantly, until porridge-like. Serve with fried onions, lemon, green chili, and ginger julienne.',
    tags: 'haleem, mutton, hyderabadi, slow cooked',
    preference: 'non-veg',
    time: '3 hrs',
    desc: 'A slow-cooked meld of mutton and broken wheat into a thick, spiced porridge — Hyderabad\'s most labor-of-love dish.',
    ingredients: ['Mutton', 'Wheat', 'Chana dal', 'Moong dal', 'Masoor dal', 'Barley', 'Onion', 'Ginger-garlic paste', 'Biryani masala', 'Whole spices', 'Ghee', 'Lemon', 'Green chili', 'Fresh ginger', 'Salt'],
    region: 'hyderabadi',
  },
  {
    idMeal: 'local-094',
    strMeal: 'Beef Rendang',
    strCategory: 'Curry',
    strArea: 'Indonesian',
    strMealThumb: 'https://www.lembehresort.com/wp-content/uploads/rendang-post-1200.jpg',
    strInstructions: 'Blend shallots, lemongrass, galangal, ginger, garlic, chili, and turmeric into a rempah paste. Brown beef chunks in oil; add the paste and cook for 5 minutes. Add coconut milk and kaffir lime leaves; bring to a boil. Reduce heat and simmer, uncovered, for 2-3 hours, stirring frequently, until the liquid evaporates and the beef fries in its own coconut fat and turns deep brown and dry-coated. Season and serve with steamed rice.',
    tags: 'rendang, beef, indonesian, coconut',
    preference: 'non-veg',
    time: '3 hrs',
    desc: 'Beef slow-fried in spiced coconut paste until dark, caramelized, and impossibly tender — Sumatra\'s masterpiece.',
    ingredients: ['Beef chuck', 'Coconut milk', 'Shallots', 'Lemongrass', 'Galangal', 'Ginger', 'Garlic', 'Dried chili', 'Turmeric', 'Kaffir lime leaves', 'Oil', 'Salt'],
    region: 'indonesian',
  },
  {
    idMeal: 'local-095',
    strMeal: 'Keema Pav',
    strCategory: 'Mains',
    strArea: 'Indian',
    strMealThumb: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_960,w_960//InstamartAssets/Receipes/mutton_keema_pav.webp',
    strInstructions: 'Sauté onion, ginger-garlic paste, and green chili in oil until golden. Add minced mutton or chicken; cook until all moisture evaporates and meat starts to fry. Add tomatoes and cook until broken down. Add cumin, coriander, garam masala, chili powder, and peas; mix well and cook for 8 minutes. Stir in fresh coriander and a squeeze of lemon. Toast pav buns in butter and serve alongside hot keema with sliced onion.',
    tags: 'keema, pav, mumbai, minced meat',
    preference: 'non-veg',
    time: '35 min',
    desc: 'Spiced minced meat cooked with peas and tomatoes served with buttery pav — Mumbai\'s hearty street-food staple.',
    ingredients: ['Minced mutton or chicken', 'Pav buns', 'Onion', 'Tomato', 'Green peas', 'Ginger-garlic paste', 'Green chili', 'Cumin', 'Coriander powder', 'Garam masala', 'Chili powder', 'Butter', 'Fresh coriander', 'Lemon', 'Oil'],
    region: 'maharashtrian',
  },
  {
    idMeal: 'local-096',
    strMeal: 'Nasi Goreng',
    strCategory: 'Rice',
    strArea: 'Indonesian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyqfHha3VWTcOJ41kTAT2M4AlSouBlDOEc1w&s',
    strInstructions: 'Fry shallots, garlic, dried shrimp paste, and red chili in oil until fragrant. Add diced chicken and prawns; stir-fry until cooked. Push to one side; scramble two eggs in the same wok. Add day-old cooked rice and toss everything together. Season with sweet soy sauce (kecap manis) and fish sauce. Stir-fry on high heat until each grain is separated and slightly crispy. Top with a fried egg, prawn crackers, cucumber, and tomato slices.',
    tags: 'fried rice, indonesian, kecap manis, egg',
    preference: 'non-veg',
    time: '20 min',
    desc: 'Indonesia\'s beloved sweet-soy fried rice with chicken, prawns, and a crowned fried egg on top.',
    ingredients: ['Cooked rice', 'Chicken', 'Prawns', 'Eggs', 'Shallots', 'Garlic', 'Shrimp paste', 'Red chili', 'Kecap manis', 'Fish sauce', 'Prawn crackers', 'Cucumber', 'Tomato', 'Oil'],
    region: 'indonesian',
  },
  {
    idMeal: 'local-097',
    strMeal: 'Chicken Chettinad',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj8wSXqniaJSPZsAoIATOurkK2DnVnY8-iyg&s',
    strInstructions: 'Dry-roast and grind cinnamon, star anise, marathi mokku, kalpasi, and black pepper with coconut into a fresh Chettinad masala. Marinate chicken with turmeric and half the masala. Fry onion until deep golden; add ginger-garlic paste, remaining masala, and tomatoes; cook until oil separates. Add marinated chicken and cook covered for 20 minutes. Finish with curry leaves, coriander, and a little tamarind water.',
    tags: 'chettinad, chicken, spicy, tamil',
    preference: 'non-veg',
    time: '1 hr',
    desc: 'South India\'s most complex, aromatic chicken curry with rare Chettinad spices — fiery, fragrant, unforgettable.',
    ingredients: ['Chicken', 'Onion', 'Tomato', 'Ginger-garlic paste', 'Chettinad spices', 'Grated coconut', 'Turmeric', 'Curry leaves', 'Tamarind', 'Fresh coriander', 'Oil', 'Salt'],
    region: 'south-indian',
  },
  {
    idMeal: 'local-098',
    strMeal: 'BBQ Pork Ribs',
    strCategory: 'Mains',
    strArea: 'American',
    strMealThumb: 'https://static.vecteezy.com/system/resources/thumbnails/044/620/074/small/succulent-bbq-pork-ribs-glazed-with-a-glossy-sauce-on-a-wooden-board-garnished-with-herbs-ideal-for-summer-cookouts-and-independence-day-celebrations-photo.jpg',
    strInstructions: 'Remove the membrane from pork ribs. Mix a dry rub of brown sugar, paprika, garlic powder, onion powder, cayenne, cumin, salt, and black pepper; apply all over ribs. Wrap in foil and bake at 150°C for 2.5 hours until tender. Unwrap, brush generously with BBQ sauce, and grill or broil on high heat for 5-8 minutes until caramelized with charred edges. Rest 5 minutes before cutting into individual ribs. Serve with coleslaw.',
    tags: 'ribs, pork, bbq, american',
    preference: 'non-veg',
    time: '3 hrs',
    desc: 'Fall-off-the-bone dry-rubbed pork ribs finished with a sticky charred BBQ glaze — summer cookout royalty.',
    ingredients: ['Pork ribs', 'Brown sugar', 'Smoked paprika', 'Garlic powder', 'Onion powder', 'Cayenne', 'Cumin', 'BBQ sauce', 'Salt', 'Black pepper'],
    region: 'american',
  },
  {
    idMeal: 'local-099',
    strMeal: 'Lamb Biryani',
    strCategory: 'Rice',
    strArea: 'Indian',
    strMealThumb: 'https://static.vecteezy.com/system/resources/previews/069/360/975/large_2x/mutton-biryani-rice-cooked-with-mutton-meat-and-spices-free-photo.jpg',
    strInstructions: 'Marinate lamb with yogurt, biryani masala, ginger-garlic paste, fried onions, and saffron. Parboil basmati rice with whole spices. In a heavy pot, layer the raw marinated lamb, half-cooked rice, fried onions, mint, saffron milk, and the remaining rice. Seal and dum-cook on very low heat for 50-60 minutes. The lamb cooks in its own steam alongside the rice. Mix gently before serving with raita and mirchi ka salan.',
    tags: 'biryani, lamb, dum cooked, hyderabadi',
    preference: 'non-veg',
    time: '2 hrs 30 min',
    desc: 'Dum-cooked tender lamb layered with fragrant saffron rice — the noblest of all biryanis.',
    ingredients: ['Lamb', 'Basmati rice', 'Yogurt', 'Biryani masala', 'Ginger-garlic paste', 'Caramelized onions', 'Saffron', 'Mint', 'Whole spices', 'Oil', 'Salt'],
    region: 'hyderabadi',
  },
  {
    idMeal: 'local-100',
    strMeal: 'Pho Bo (Beef Pho)',
    strCategory: 'Soups',
    strArea: 'Vietnamese',
    strMealThumb: 'https://media.istockphoto.com/id/1687829797/photo/pho-bo-for-breakfast-in-vietnam-stock-photo.jpg?s=612x612&w=0&k=20&c=5aWVkSBZikSPsZMPoAJZWXGKiw3ZvlxrcaldJx0w0_c=',
    strInstructions: 'Char ginger and onion directly over flame; set aside. Simmer beef bones for 30 minutes, then discard water and rinse. Refill with clean water; add charred ginger and onion, star anise, cinnamon, cloves, cardamom, rock sugar, and fish sauce; simmer for 4 hours. Strain and season the clear broth. Soak rice noodles. Arrange noodles in bowls; add thinly sliced raw beef. Pour boiling broth over to cook the beef. Serve with bean sprouts, Thai basil, lime, hoisin, and sriracha.',
    tags: 'pho, vietnamese, beef, noodle soup',
    preference: 'non-veg',
    time: '5 hrs',
    desc: 'Crystal-clear, deeply aromatic beef broth over rice noodles and paper-thin beef — Vietnam\'s national treasure.',
    ingredients: ['Beef bones', 'Beef sirloin', 'Rice noodles', 'Ginger', 'Onion', 'Star anise', 'Cinnamon', 'Cloves', 'Cardamom', 'Rock sugar', 'Fish sauce', 'Bean sprouts', 'Thai basil', 'Lime', 'Hoisin sauce', 'Sriracha'],
    region: 'vietnamese',
  },
  {
    idMeal: 'local-101',
    strMeal: 'Chicken Korma',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEaruGM76QXASr73Dq0iLCiDKAe89gWPvqqw&s',
    strInstructions: 'Blend onion with cashews and poppy seeds to a smooth paste. Marinate chicken in yogurt and ginger-garlic paste. Fry the onion-nut paste in ghee until deep golden. Add chicken and sear briefly. Add warm water or stock, cardamom, cinnamon, mace, and bay leaf; simmer covered for 25 minutes. Stir in cream and kewra water; simmer 5 more minutes. Adjust seasoning and garnish with fried onions and saffron.',
    tags: 'korma, chicken, mughal, rich',
    preference: 'non-veg',
    time: '1 hr',
    desc: 'Mellow, fragrant Mughal korma with chicken in a cashew-cream sauce perfumed with cardamom and kewra.',
    ingredients: ['Chicken', 'Yogurt', 'Onion', 'Cashews', 'Poppy seeds', 'Cream', 'Ghee', 'Cardamom', 'Cinnamon', 'Mace', 'Kewra water', 'Saffron', 'Ginger-garlic paste', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-102',
    strMeal: 'Prawn Pad Thai',
    strCategory: 'Noodles',
    strArea: 'Thai',
    strMealThumb: 'https://media.hellofresh.com/q_100,w_3840,f_auto,c_limit,fl_lossy/recipes/image/prawn-pad-thai-7bb184d7-c94831de.jpg',
    strMealThumb: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80',
    strInstructions: 'Soak rice noodles until pliable; drain. Stir-fry prawns in a hot wok with oil until pink; push to side. Add garlic and shallots; fry briefly. Add noodles, tamarind paste, fish sauce, palm sugar, and a dash of soy sauce; toss vigorously. Push noodles aside; scramble two eggs in the wok. Toss everything together with bean sprouts and spring onions. Plate and top with crushed roasted peanuts, lime wedges, and chili powder.',
    tags: 'pad thai, prawns, thai, noodles',
    preference: 'non-veg',
    time: '25 min',
    desc: 'Wok-seared prawns and rice noodles tossed in tamarind sauce with a golden egg and peanut crunch.',
    ingredients: ['Rice noodles', 'Prawns', 'Eggs', 'Tamarind paste', 'Fish sauce', 'Palm sugar', 'Bean sprouts', 'Spring onions', 'Garlic', 'Shallots', 'Crushed peanuts', 'Lime', 'Chili powder', 'Oil'],
    region: 'thai',
  },
  {
    idMeal: 'local-103',
    strMeal: 'Carne Asada',
    strCategory: 'Mains',
    strArea: 'Mexican',
    strMealThumb: 'https://www.mashed.com/img/gallery/the-untold-truth-of-carne-asada/mouth-watering-additions-to-your-carne-asada-1639090335.jpg',
    strInstructions: 'Marinate skirt steak in citrus juice (orange and lime), garlic, cumin, oregano, chili powder, and olive oil for 2 hours. Grill over a screaming hot grill for 3-4 minutes per side for medium-rare. Rest for 5 minutes before slicing thinly against the grain. Serve on warm corn tortillas with fresh guacamole, pico de gallo, and pickled jalapeños, or slice into a rice and bean bowl.',
    tags: 'carne asada, steak, mexican, grilled',
    preference: 'non-veg',
    time: '2 hrs + 15 min',
    desc: 'Citrus-marinated skirt steak grilled over high heat and sliced thin — Mexico\'s finest for tacos or bowls.',
    ingredients: ['Skirt steak', 'Orange juice', 'Lime juice', 'Garlic', 'Cumin', 'Oregano', 'Chili powder', 'Olive oil', 'Corn tortillas', 'Guacamole', 'Pico de gallo', 'Pickled jalapeños'],
    region: 'mexican',
  },
  {
    idMeal: 'local-104',
    strMeal: 'Chicken Soup',
    strCategory: 'Soups',
    strArea: 'American',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv7Qey07U0UnHUFDp8pSOFX0BH71gxQrBIgg&s',
    strInstructions: 'Simmer a whole chicken in a large pot with onion, carrots, celery, bay leaves, peppercorns, and water for 90 minutes. Remove chicken; strip the meat and discard bones. Strain the broth. Return broth to pot with diced carrots, celery, and onion; cook for 15 minutes. Add egg noodles and cook until tender. Add shredded chicken back in, season generously with salt and pepper, and finish with fresh dill and parsley.',
    tags: 'chicken soup, comfort, american, noodles',
    preference: 'non-veg',
    time: '2 hrs',
    desc: 'Golden, restorative chicken noodle soup from a whole-chicken broth — the universal cure for everything.',
    ingredients: ['Whole chicken', 'Carrots', 'Celery', 'Onion', 'Egg noodles', 'Bay leaves', 'Fresh dill', 'Fresh parsley', 'Salt', 'Black pepper'],
    region: 'american',
  },
  {
    idMeal: 'local-105',
    strMeal: 'Hyderabadi Mutton Dum',
    strCategory: 'Mains',
    strArea: 'Indian',
    strMealThumb: 'https://c.ndtvimg.com/2024-06/v60q573g_biryani_625x300_17_June_24.jpg?im=FeatureCrop,algorithm=dnn,width=384,height=384',
    strInstructions: 'Marinate mutton with raw papaya paste (tenderizer), yogurt, fried onions, ginger-garlic paste, and Hyderabadi spices overnight. In a heavy pot, layer the marinated mutton. Cover tightly with foil and a lid; place on a hot tawa and cook on dum for 1.5 hours on low heat. Serve garnished with fried onions, mint, and a drizzle of saffron milk — no additional water is needed as the mutton cooks in its own juices.',
    tags: 'mutton dum, hyderabadi, sealed pot, slow cooked',
    preference: 'non-veg',
    time: '12 hrs + 2 hrs',
    desc: 'Mutton sealed in its own spiced marinade and slow-cooked under a closed lid — pure Hyderabadi heritage.',
    ingredients: ['Mutton', 'Raw papaya paste', 'Yogurt', 'Caramelized onions', 'Ginger-garlic paste', 'Hyderabadi spice mix', 'Saffron', 'Mint', 'Salt'],
    region: 'hyderabadi',
  },
  {
    idMeal: 'local-106',
    strMeal: 'Paella de Mariscos',
    strCategory: 'Rice',
    strArea: 'Spanish',
    strMealThumb: 'https://steba.com/wp-content/uploads/2025/04/Paella-de-Marisco-1.png',
    strInstructions: 'Heat olive oil in a paella pan; sauté onion, garlic, and tomatoes until softened. Add bomba rice and stir to coat. Pour in saffron-infused seafood stock (twice the volume of rice); do not stir again. Cook on medium heat for 10 minutes. Arrange prawns, mussels, squid, and clams on top; cook 10 more minutes until shellfish open and rice has formed a socarrat (golden crust at the bottom). Rest 5 minutes and serve with lemon wedges.',
    tags: 'paella, spanish, seafood, saffron',
    preference: 'non-veg',
    time: '45 min',
    desc: 'Saffron-scented Spanish rice with a medley of prawns, mussels, and squid — the king of seafood rice dishes.',
    ingredients: ['Bomba rice', 'Prawns', 'Mussels', 'Squid', 'Clams', 'Saffron', 'Seafood stock', 'Onion', 'Garlic', 'Tomatoes', 'Olive oil', 'Lemon', 'Salt'],
    region: 'spanish',
  },
  {
    idMeal: 'local-107',
    strMeal: 'Chicken Saag',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://www.shutterstock.com/image-photo/rich-spicy-indian-chicken-saag-600nw-2497839665.jpg',
    strInstructions: 'Blanch spinach and mustard greens; blend into a semi-smooth purée. Brown chicken pieces in oil and set aside. Fry onion, ginger, and garlic until golden; add tomatoes and spices (cumin, coriander, garam masala, turmeric). Add the greens purée and cook for 8 minutes. Add browned chicken; simmer covered for 20 minutes until cooked through. Finish with cream and butter.',
    tags: 'chicken, spinach, saag, punjabi',
    preference: 'non-veg',
    time: '50 min',
    desc: 'Succulent chicken pieces in a deep emerald spinach-mustard green gravy — robust, nutritious Punjabi cooking.',
    ingredients: ['Chicken', 'Spinach', 'Mustard greens', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Cumin', 'Coriander', 'Garam masala', 'Turmeric', 'Cream', 'Butter', 'Oil', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-108',
    strMeal: 'Tonkatsu',
    strCategory: 'Mains',
    strArea: 'Japanese',
    strMealThumb: 'https://static01.nyt.com/images/2024/02/28/multimedia/ND-tonkatsu-hbtg/ND-tonkatsu-hbtg-threeByTwoMediumAt2X.jpg',
    strInstructions: 'Pound pork cutlets to even thickness; season with salt and pepper. Dredge in flour, dip in beaten egg, then coat generously in panko breadcrumbs, pressing firmly. Deep-fry in oil at 170°C for 5-6 minutes until deep golden and cooked through; drain on a rack. Slice into strips and serve over shredded cabbage with a drizzle of tonkatsu sauce, Kewpie mayo, and Japanese mustard. Accompany with steamed rice and miso soup.',
    tags: 'tonkatsu, pork, japanese, fried',
    preference: 'non-veg',
    time: '25 min',
    desc: 'Golden panko-crusted pork cutlet with sweet-savory tonkatsu sauce — Japan\'s ultimate comfort fried food.',
    ingredients: ['Pork cutlets', 'Panko breadcrumbs', 'Eggs', 'Flour', 'Tonkatsu sauce', 'Kewpie mayo', 'Shredded cabbage', 'Japanese mustard', 'Steamed rice', 'Oil', 'Salt', 'Black pepper'],
    region: 'japanese',
  },
  {
    idMeal: 'local-109',
    strMeal: 'Seekh Kebab',
    strCategory: 'Starters',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjea4j-EO6GWbl1YzXpD18mc9N7O3SnbgYSA&s',
    strInstructions: 'Mix finely minced mutton with raw papaya paste, onion, ginger-garlic paste, green chili, roasted cumin, black pepper, garam masala, fresh coriander, and mint. Season generously and refrigerate for 1 hour. Divide and mold onto flat metal skewers in a sausage shape. Grill over charcoal or under a broiler for 10-12 minutes, turning to cook evenly, until charred. Serve with mint chutney, sliced onion rings, and lemon.',
    tags: 'seekh kebab, mutton, grilled, starter',
    preference: 'non-veg',
    time: '1 hr 20 min',
    desc: 'Minced spiced mutton on skewers grilled over charcoal — the smoky, meltingly tender kebab of Mughal origin.',
    ingredients: ['Minced mutton', 'Raw papaya paste', 'Onion', 'Ginger-garlic paste', 'Green chili', 'Roasted cumin', 'Garam masala', 'Fresh coriander', 'Mint', 'Lemon', 'Salt', 'Black pepper'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-110',
    strMeal: 'Eggs Benedict',
    strCategory: 'Breakfast',
    strArea: 'American',
    strMealThumb: 'https://www.foodandwine.com/thmb/iy4Bh8qWahCq-FbMmVa8PMK_33c=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Lobster-Eggs-Benedict-FT-0324-eae388575e9745c49335cfee8682aa6f.jpg',
    strInstructions: 'Make hollandaise: whisk egg yolks with lemon juice in a bowl over barely simmering water until thick and pale; slowly drizzle in melted warm butter while whisking continuously until emulsified. Season with salt and cayenne. Poach eggs in simmering water with a splash of vinegar for 3-4 minutes. Toast English muffins; top each half with a slice of Canadian bacon briefly warmed in a pan, a poached egg, and a generous spoonful of hollandaise. Garnish with paprika and chives.',
    tags: 'eggs benedict, brunch, hollandaise, american',
    preference: 'non-veg',
    time: '30 min',
    desc: 'Poached egg and Canadian bacon on an English muffin, crowned with silky lemon hollandaise — brunch royalty.',
    ingredients: ['Eggs', 'Canadian bacon', 'English muffins', 'Butter', 'Lemon juice', 'Cayenne', 'White vinegar', 'Chives', 'Paprika', 'Salt'],
    region: 'american',
  },
  {
    idMeal: 'local-111',
    strMeal: 'Kung Pao Chicken',
    strCategory: 'Mains',
    strArea: 'Chinese',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKM28d2mcdrWGXdlxILDKEXwi20esm8geBLQ&s',
    strInstructions: 'Marinate diced chicken breast in soy sauce, Shaoxing wine, and cornstarch. Make the sauce by mixing soy sauce, vinegar, hoisin, sugar, cornstarch, and sesame oil. Stir-fry Sichuan peppercorns and dried chilies in hot oil until fragrant. Add chicken and stir-fry until golden. Add garlic and ginger; toss briefly. Pour in the sauce and stir until glossy and thickened. Toss in roasted peanuts and spring onions.',
    tags: 'kung pao, chinese, chicken, peanuts',
    preference: 'non-veg',
    time: '25 min',
    desc: 'Numbing Sichuan peppercorn chicken with dried chilies and roasted peanuts in a glossy tangy sauce.',
    ingredients: ['Chicken breast', 'Roasted peanuts', 'Dried chilies', 'Sichuan peppercorns', 'Garlic', 'Ginger', 'Soy sauce', 'Shaoxing wine', 'Hoisin sauce', 'Vinegar', 'Sugar', 'Cornstarch', 'Sesame oil', 'Spring onions', 'Oil'],
    region: 'chinese',
  },
  {
    idMeal: 'local-112',
    strMeal: 'Mutton Keema',
    strCategory: 'Mains',
    strArea: 'Indian',
    strMealThumb: 'https://www.moley.com/wp-content/uploads/2025/08/Lamb-Keema.webp',
    strInstructions: 'Fry whole spices in oil, then add onions until golden. Stir in ginger-garlic paste and cook for 2 minutes. Add minced mutton and cook until moisture evaporates and meat browns. Add tomatoes, turmeric, cumin, coriander, chili powder, and garam masala; cook until oil separates. Add peas and a splash of water; simmer covered for 15 minutes. Garnish with fresh coriander and lemon. Serve with paratha.',
    tags: 'keema, mutton, minced, north indian',
    preference: 'non-veg',
    time: '40 min',
    desc: 'Spiced minced mutton cooked with green peas until perfectly dry and fragrant — a North Indian weeknight hero.',
    ingredients: ['Minced mutton', 'Green peas', 'Onion', 'Tomato', 'Ginger-garlic paste', 'Turmeric', 'Cumin', 'Coriander powder', 'Chili powder', 'Garam masala', 'Whole spices', 'Fresh coriander', 'Lemon', 'Oil', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-113',
    strMeal: 'Tom Yum Goong',
    strCategory: 'Soups',
    strArea: 'Thai',
    strMealThumb: 'https://i.pinimg.com/474x/5a/45/70/5a4570bdbc18d656933fb388f58fe032.jpg',
    strInstructions: 'Simmer water with lemongrass, galangal, kaffir lime leaves, and crushed bird\'s eye chilies for 10 minutes to build the base. Add prawns and mushrooms; cook for 4 minutes until prawns are pink. Season with fish sauce, lime juice, and chili paste (nam prik pao). Taste and balance sour, salty, and spicy. If making the creamy version, stir in coconut milk. Garnish with fresh coriander and spring onions.',
    tags: 'tom yum, thai, prawns, hot and sour',
    preference: 'non-veg',
    time: '20 min',
    desc: 'Thailand\'s electrifying hot-and-sour prawn soup fragrant with lemongrass and galangal — bold, bright, addictive.',
    ingredients: ['Prawns', 'Mushrooms', 'Lemongrass', 'Galangal', 'Kaffir lime leaves', 'Bird\'s eye chili', 'Fish sauce', 'Lime juice', 'Nam prik pao', 'Fresh coriander', 'Spring onions'],
    region: 'thai',
  },
  {
    idMeal: 'local-114',
    strMeal: 'Chicken Manchurian',
    strCategory: 'Starters',
    strArea: 'Indian',
    strMealThumb: 'https://media.istockphoto.com/id/1208083887/photo/freshly-prepared-veg-manchurian-with-a-bowl-of-fried-rice.jpg?s=612x612&w=0&k=20&c=nTtgKk-SSQAh1E0Pz8SnpGjqMRSIIXM6XiDHIsd5LDQ=',
    strInstructions: 'Make a batter with maida, cornflour, soy sauce, ginger-garlic paste, and egg; add chicken pieces and deep-fry until golden. In a wok, sauté garlic, ginger, green chili, and spring onion whites. Add soy sauce, chili sauce, vinegar, tomato ketchup, and a cornflour slurry; bring to a bubble. Toss in fried chicken to coat. Garnish with spring onion greens and sesame seeds.',
    tags: 'manchurian, indo-chinese, chicken, fried',
    preference: 'non-veg',
    time: '35 min',
    desc: 'Crispy fried chicken in a sticky tangy Indo-Chinese sauce — the sub-continent\'s favourite party starter.',
    ingredients: ['Chicken', 'Maida', 'Cornflour', 'Egg', 'Soy sauce', 'Chili sauce', 'Tomato ketchup', 'Vinegar', 'Garlic', 'Ginger', 'Green chili', 'Spring onions', 'Sesame seeds', 'Oil'],
    region: 'indo-chinese',
  },
  {
    idMeal: 'local-115',
    strMeal: 'Lamb Chops with Rosemary',
    strCategory: 'Mains',
    strArea: 'French',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYOLhbVBu_hXm7yXkkKfjOWULGJg-yR9Lz4w&s',
    strInstructions: 'Pat lamb chops dry; season with salt and pepper. Press crushed garlic and fresh rosemary into both sides. Sear in a very hot cast-iron pan with olive oil for 3 minutes per side for medium-rare. Add butter, thyme, and garlic to the pan; baste the chops for 1 minute. Rest for 5 minutes. Serve with Dijon mustard, roasted garlic mashed potatoes, and wilted greens.',
    tags: 'lamb chops, french, rosemary, seared',
    preference: 'non-veg',
    time: '20 min',
    desc: 'Seared lamb chops with rosemary and garlic butter — elegant, blushing pink, and ready in under 20 minutes.',
    ingredients: ['Lamb chops', 'Rosemary', 'Garlic', 'Butter', 'Thyme', 'Olive oil', 'Dijon mustard', 'Salt', 'Black pepper'],
    region: 'french',
  },
  {
    idMeal: 'local-116',
    strMeal: 'Egg Fried Rice',
    strCategory: 'Rice',
    strArea: 'Chinese',
    strMealThumb: 'https://www.thedailymeal.com/img/gallery/12-ways-people-enjoy-fried-rice-around-the-world/l-intro-1678310123.jpg',
    strInstructions: 'Use day-old cold rice. Heat a wok until smoking; add oil, then scramble eggs until just set and break into pieces. Add spring onion whites, garlic, and ginger; stir-fry 30 seconds. Add the cold rice in batches, pressing to break up clumps, and toss constantly on high heat. Season with soy sauce, oyster sauce, white pepper, and sesame oil. Toss in spring onion greens and serve immediately.',
    tags: 'fried rice, chinese, eggs, quick',
    preference: 'non-veg',
    time: '15 min',
    desc: 'Wok-tossed day-old rice with scrambled eggs and soy in under 15 minutes — a master class in pantry cooking.',
    ingredients: ['Day-old cooked rice', 'Eggs', 'Spring onions', 'Garlic', 'Ginger', 'Soy sauce', 'Oyster sauce', 'White pepper', 'Sesame oil', 'Oil'],
    region: 'chinese',
  },
  {
    idMeal: 'local-117',
    strMeal: 'Kerala Prawn Curry',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://thumbs.dreamstime.com/b/prawns-curry-rice-kerala-fish-curry-prawns-curry-rice-kerala-fish-curry-spicy-prawns-masala-dark-black-background-189647931.jpg',
    strInstructions: 'Heat coconut oil in an earthen pot; add mustard seeds and curry leaves. Sauté shallots, ginger, and green chili until soft. Add tomatoes, turmeric, and Kerala fish masala; cook until oil separates. Pour in thin coconut milk and simmer for 5 minutes. Add cleaned prawns and cook for 7 minutes. Add thick coconut milk and bring to a gentle simmer; do not boil. Finish with a raw drizzle of coconut oil and fresh curry leaves.',
    tags: 'prawns, kerala, coconut, seafood',
    preference: 'non-veg',
    time: '30 min',
    desc: 'Plump prawns in a golden coconut and spice curry with that distinctive Kerala coconut oil finish.',
    ingredients: ['Prawns', 'Coconut milk', 'Shallots', 'Tomato', 'Ginger', 'Green chili', 'Kerala fish masala', 'Turmeric', 'Mustard seeds', 'Curry leaves', 'Coconut oil', 'Salt'],
    region: 'south-indian',
  },
  {
    idMeal: 'local-118',
    strMeal: 'Pasta Carbonara',
    strCategory: 'Pasta',
    strArea: 'Italian',
    strMealThumb: 'https://www.smeg.com/binaries/content/gallery/smeg-southafrica/lifestyle-images/traditional-spaghetti-carbonara-top-image-web.jpg/traditional-spaghetti-carbonara-top-image-web.jpg/brx%3ApostcardDeskLarge',
    strInstructions: 'Cook spaghetti until al dente; reserve 1 cup pasta water. Fry guanciale (or pancetta) in a dry pan until crispy; remove from heat. Whisk egg yolks with whole egg and grated Pecorino Romano; season with black pepper. Off the heat, toss hot drained spaghetti with the guanciale and its fat. Quickly add egg mixture, tossing vigorously and adding pasta water gradually to create a silky, creamy sauce — never scrambled.',
    tags: 'carbonara, pasta, italian, eggs',
    preference: 'non-veg',
    time: '25 min',
    desc: 'The authentic Roman carbonara — no cream, just egg yolks, Pecorino, and guanciale in a silky emulsion.',
    ingredients: ['Spaghetti', 'Guanciale or pancetta', 'Egg yolks', 'Whole egg', 'Pecorino Romano', 'Black pepper', 'Salt'],
    region: 'italian',
  },
  {
    idMeal: 'local-119',
    strMeal: 'Chicken Frankie Roll',
    strCategory: 'Wraps',
    strArea: 'Indian',
    strMealThumb: 'https://www.brakebush.com/wp-content/uploads/Chicken-Frankie-Rolls.jpg',
    strInstructions: 'Marinate chicken strips in yogurt, lime juice, and tikka masala for 30 minutes; cook in a skillet until charred and cooked. Make parathas and cook each with an egg beaten and spread on top (egg paratha). Layer the egg side up with green chutney, chicken strips, sliced onion rings, chaat masala, and a drizzle of hot sauce. Roll tightly in foil and serve immediately.',
    tags: 'frankie roll, chicken, wrap, kolkata',
    preference: 'non-veg',
    time: '45 min',
    desc: 'Spiced tikka chicken rolled in an egg paratha with green chutney and onions — Kolkata\'s iconic street roll.',
    ingredients: ['Chicken', 'Whole wheat flour', 'Eggs', 'Yogurt', 'Tikka masala', 'Green chutney', 'Onion', 'Chaat masala', 'Lime juice', 'Hot sauce', 'Oil'],
    region: 'indian',
  },
  {
    idMeal: 'local-120',
    strMeal: 'Beef Bulgogi',
    strCategory: 'Mains',
    strArea: 'Korean',
    strMealThumb: 'https://wallpapers.com/images/hd/bulgogi-meat-green-bm0m845atcowlaok.jpg',
    strInstructions: 'Slice beef ribeye or sirloin paper-thin (partially freeze for ease). Marinate in soy sauce, sugar, sesame oil, grated Asian pear or kiwi (tenderizer), garlic, ginger, and black pepper for 1 hour. Stir-fry in batches in a screaming hot pan or grill until caramelized at the edges. Serve over steamed rice, inside lettuce wraps with sliced garlic, or with banchan (Korean side dishes).',
    tags: 'bulgogi, korean, beef, marinated',
    preference: 'non-veg',
    time: '1 hr 15 min',
    desc: 'Paper-thin caramelized Korean marinated beef with sesame and pear — sweet, savory, and impossibly tender.',
    ingredients: ['Beef ribeye', 'Soy sauce', 'Sugar', 'Sesame oil', 'Asian pear', 'Garlic', 'Ginger', 'Black pepper', 'Steamed rice', 'Lettuce leaves', 'Sesame seeds'],
    region: 'korean',
  },
  {
    idMeal: 'local-121',
    strMeal: 'Dhansak',
    strCategory: 'Mains',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnoLoTqxzxNYHD9nPLEMZgA7Az_UNOG8Yeyg&s',
    strInstructions: 'Pressure cook a mixture of four lentils (toor, masoor, chana, and moong) with cubed pumpkin and eggplant until very soft; mash together. In a separate pan, brown mutton pieces; set aside. Fry a base of onion, ginger, garlic, and dhansak masala until deeply colored; add the mashed lentil-vegetable purée and browned mutton. Simmer together for 30 minutes. Add tamarind and jaggery to balance. Serve with brown rice cooked with whole spices.',
    tags: 'dhansak, parsi, mutton, lentils',
    preference: 'non-veg',
    time: '1 hr 30 min',
    desc: 'The crown jewel of Parsi cuisine — mutton slow-cooked in a rich sweet-sour-spiced lentil-vegetable purée.',
    ingredients: ['Mutton', 'Toor dal', 'Masoor dal', 'Chana dal', 'Moong dal', 'Pumpkin', 'Eggplant', 'Onion', 'Ginger-garlic paste', 'Dhansak masala', 'Tamarind', 'Jaggery', 'Oil', 'Salt'],
    region: 'parsi',
  },
  {
    idMeal: 'local-122',
    strMeal: 'Crab Xacuti',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://foodlifeandmoney.com/wp-content/uploads/2019/03/Crab-xacuti-blog-1.jpg',
    strInstructions: 'Dry-roast coconut, dried red chilies, coriander seeds, cumin, black pepper, cloves, cinnamon, star anise, and nutmeg; blend into a smooth xacuti masala. Fry onions until dark golden; add ginger-garlic paste and the masala; cook for 5 minutes. Add cleaned crab pieces and coat in the masala. Add water and tamarind; cover and cook for 15-20 minutes until crab is cooked and the gravy is rich. Finish with fresh coriander.',
    tags: 'xacuti, crab, goan, coconut masala',
    preference: 'non-veg',
    time: '50 min',
    desc: 'Goa\'s most festive crab curry — complex roasted coconut-spice xacuti masala with a rich, aromatic depth.',
    ingredients: ['Crab', 'Grated coconut', 'Dried red chilies', 'Coriander seeds', 'Cumin', 'Black pepper', 'Cloves', 'Cinnamon', 'Star anise', 'Nutmeg', 'Onion', 'Ginger-garlic paste', 'Tamarind', 'Fresh coriander', 'Oil', 'Salt'],
    region: 'goan',
  },
  {
    idMeal: 'local-123',
    strMeal: 'Chicken Caesar Salad',
    strCategory: 'Salad',
    strArea: 'American',
    strMealThumb: 'https://thefrizzledleek.com/wp-content/uploads/2025/01/buffalo-chicken-caesar-salad-featured-image.jpg',
    strInstructions: 'Make the Caesar dressing by whisking together minced anchovy paste, garlic, Dijon mustard, lemon juice, Worcestershire sauce, egg yolk, olive oil, and Parmesan until emulsified. Season with salt and pepper. Grill chicken breast seasoned with salt, pepper, and olive oil until cooked through; slice. Tear romaine lettuce and toss with dressing and croutons. Top with sliced chicken and extra shaved Parmesan.',
    tags: 'caesar, chicken, salad, american',
    preference: 'non-veg',
    time: '30 min',
    desc: 'Crisp romaine, grilled chicken, and golden croutons in a bold anchovy-Parmesan Caesar — a timeless classic.',
    ingredients: ['Chicken breast', 'Romaine lettuce', 'Parmesan', 'Croutons', 'Anchovy paste', 'Garlic', 'Dijon mustard', 'Lemon juice', 'Worcestershire sauce', 'Egg yolk', 'Olive oil', 'Salt', 'Black pepper'],
    region: 'american',
  },
  {
    idMeal: 'local-124',
    strMeal: 'Baingan with Keema',
    strCategory: 'Mains',
    strArea: 'Indian',
    strMealThumb: 'https://english.cdn.zeenews.com/sites/default/files/2026/01/30/1898706-penguinssssssss-11.jpg?im=FitAndFill=(400,300)',
    strInstructions: 'Cut eggplant into cubes; salt and rest for 10 minutes; pat dry. Fry eggplant in oil until golden and soft; set aside. In the same pan, cook minced meat with onion, ginger-garlic paste, and tomatoes until dry and brown. Add all ground spices and cook until aromatic. Fold in the fried eggplant pieces; mix gently and cook for 5 minutes. Finish with fresh coriander and a squeeze of lemon.',
    tags: 'keema, eggplant, minced meat, north indian',
    preference: 'non-veg',
    time: '40 min',
    desc: 'Tender golden eggplant folded into spiced minced meat — a deeply savory North Indian pairing.',
    ingredients: ['Eggplant', 'Minced meat', 'Onion', 'Tomato', 'Ginger-garlic paste', 'Turmeric', 'Cumin', 'Coriander powder', 'Garam masala', 'Chili powder', 'Fresh coriander', 'Lemon', 'Oil', 'Salt'],
    region: 'north-indian',
  },
  {
    idMeal: 'local-125',
    strMeal: 'Lobster Thermidor',
    strCategory: 'Mains',
    strArea: 'French',
    strMealThumb: 'https://www.thammachartseafood.com/cdn/shop/articles/custom_resized_c2ce2d9c-242a-41b3-91c8-8d9135db3c53.jpg?v=1645092146',
    strInstructions: 'Split live lobster in half lengthways; grill cut-side down for 5 minutes. Make a sauce by reducing white wine and shallots; add a Mornay base (béchamel with Gruyère), Dijon mustard, tarragon, and a splash of cognac. Remove cooked lobster meat from the shell; mix with half the sauce. Return to the shells; top with remaining sauce and Gruyère. Grill under a hot broiler until golden and bubbling. Serve immediately with lemon.',
    tags: 'lobster, french, thermidor, luxury',
    preference: 'non-veg',
    time: '50 min',
    desc: 'Lobster in its shell glazed with cognac Mornay sauce and broiled until golden — French fine dining at home.',
    ingredients: ['Whole lobster', 'White wine', 'Shallots', 'Butter', 'Flour', 'Milk', 'Gruyère', 'Dijon mustard', 'Tarragon', 'Cognac', 'Lemon', 'Salt', 'Black pepper'],
    region: 'french',
  },
  {
    idMeal: 'local-126',
    strMeal: 'Chicken Xacuti',
    strCategory: 'Curry',
    strArea: 'Indian',
    strMealThumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRlsDW1Q7PlLPRrUTqjNDPKevwZPYgudiVJXyTnrC-UyjBUeqwEd0rvaqcjKnnJkI5WYb5zglaVzAa_ntMP2dRcTw51l9E9kuxNXcXQg&s=10',
    strInstructions: 'Dry-roast grated coconut, dried red chilies, coriander, cumin, black pepper, cloves, cinnamon, star anise, and nutmeg until aromatic; grind with a little water to a paste. Marinate chicken with half the paste, turmeric, and lime juice. Fry onions until golden; add ginger-garlic paste and remaining masala; cook for 5 minutes. Add marinated chicken and stir-fry briefly. Add water and tamarind water; simmer covered for 20 minutes until cooked. Garnish with coriander.',
    tags: 'xacuti, goan, chicken, coconut masala',
    preference: 'non-veg',
    time: '1 hr',
    desc: 'Goa\'s complex, aromatic roasted coconut-spice curry with chicken — a dish that rewards every extra step.',
    ingredients: ['Chicken', 'Grated coconut', 'Dried red chilies', 'Coriander seeds', 'Cumin', 'Black pepper', 'Cloves', 'Cinnamon', 'Star anise', 'Nutmeg', 'Onion', 'Ginger-garlic paste', 'Turmeric', 'Tamarind', 'Lime juice', 'Fresh coriander', 'Oil', 'Salt'],
    region: 'goan',
  },
];


// ── STATE ──────────────────────────────────────────────────
const state = {
  ingredients: [],
  preference: 'vegetarian',
  filter: 'all',
  recipes: [],
  favorites: JSON.parse(localStorage.getItem('bb_favorites') || '[]'),
  recents: JSON.parse(localStorage.getItem('bb_recents') || '[]'),
  darkMode: localStorage.getItem('bb_dark') === 'true',
};

// ── DOM REFS ───────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

const ingredientInput  = $('ingredientInput');
const addBtn           = $('addIngredientBtn');
const tagsContainer    = $('tagsContainer');
const prefTabs         = $$('#prefTabs .pref-tab');
const filterChips      = $$('#filterChips .filter-chip');
const searchBtn        = $('searchBtn');
const clearBtn         = $('clearBtn');
const recipeGrid       = $('recipeGrid');
const spinnerWrap      = $('spinnerWrap');
const emptyState       = $('emptyState');
const resultsHeader    = $('resultsHeader');
const resultsTitle     = $('resultsTitle');
const resultsCount     = $('resultsCount');
const modalOverlay     = $('modalOverlay');
const modalContent     = $('modalContent');
const modalClose       = $('modalClose');
const toastContainer   = $('toastContainer');
const themeToggle      = $('themeToggle');
const surpriseBtn      = $('surpriseBtn');
const surpriseBtnMob   = $('surpriseBtnMobile');
const recentsList      = $('recentsList');
const favGrid          = $('favGrid');
const favEmpty         = $('favEmpty');
const hamburger        = $('hamburger');
const mobileMenu       = $('mobileMenu');

// ── INIT ───────────────────────────────────────────────────
function init() {
  applyTheme();
  renderRecents();
  renderFavorites();

  // Event listeners
  addBtn.addEventListener('click', handleAddIngredient);
  ingredientInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddIngredient(); }
  });

  prefTabs.forEach((tab) => tab.addEventListener('click', () => {
    prefTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    state.preference = tab.dataset.pref;
  }));

  filterChips.forEach((chip) => chip.addEventListener('click', () => {
    filterChips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    state.filter = chip.dataset.filter;
  }));

  searchBtn.addEventListener('click', handleSearch);
  clearBtn.addEventListener('click', handleClear);
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  themeToggle.addEventListener('click', toggleTheme);
  surpriseBtn.addEventListener('click', handleSurprise);
  if (surpriseBtnMob) surpriseBtnMob.addEventListener('click', handleSurprise);

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// ── THEME ──────────────────────────────────────────────────
function applyTheme() {
  document.documentElement.dataset.theme = state.darkMode ? 'dark' : 'light';
  $('themeToggle').querySelector('.theme-icon').textContent = state.darkMode ? '☀️' : '🌙';
}

function toggleTheme() {
  state.darkMode = !state.darkMode;
  localStorage.setItem('bb_dark', state.darkMode);
  applyTheme();
}

// ── INGREDIENT MANAGEMENT ──────────────────────────────────
function handleAddIngredient() {
  const raw = ingredientInput.value.trim();
  if (!raw) return;

  // Support comma-separated input
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  let added = 0;
  parts.forEach((ing) => {
    const lower = ing.toLowerCase();
    if (!state.ingredients.includes(lower)) {
      state.ingredients.push(lower);
      added++;
    }
  });

  ingredientInput.value = '';
  renderTags();
  if (added > 0) {
    showToast(`Added ${added} ingredient${added > 1 ? 's' : ''} ✅`, 'success');
  } else {
    showToast('Ingredient already added', 'warning');
  }
}

function removeIngredient(ing) {
  state.ingredients = state.ingredients.filter((i) => i !== ing);
  renderTags();
}

function renderTags() {
  tagsContainer.innerHTML = '';
  state.ingredients.forEach((ing) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `
      ${ing}
      <button class="tag-remove" aria-label="Remove ${ing}">✕</button>
    `;
    tag.querySelector('.tag-remove').addEventListener('click', () => removeIngredient(ing));
    tagsContainer.appendChild(tag);
  });
}

// ── SEARCH ─────────────────────────────────────────────────
async function handleSearch() {
  if (state.ingredients.length === 0) {
    showToast('Please add at least one ingredient 🥕', 'warning');
    return;
  }

  showLoading(true);
  saveRecent(state.ingredients.join(', '));

  try {
    const results = await fetchRecipes(state.ingredients);
    state.recipes = results;
    renderRecipes(results);
  } catch (err) {
    console.error(err);
    showToast('Oops! Something went wrong. Showing local recipes.', 'error');
    const fallback = filterLocalRecipes(state.ingredients, state.preference, state.filter);
    state.recipes = fallback;
    renderRecipes(fallback);
  } finally {
    showLoading(false);
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Fetch recipes from TheMealDB API based on ingredients.
 * Strategy: search by each ingredient keyword, collect unique Indian meals.
 */
async function fetchRecipes(ingredients) {
  const seen = new Set();
  let apiResults = [];

  // Search by each ingredient
  const searchTerms = ingredients.length > 0 ? ingredients : ['chicken'];

  const promises = searchTerms.map((ing) =>
    fetch(`${MEAL_API}/filter.php?i=${encodeURIComponent(ing)}`)
      .then((r) => r.json())
      .catch(() => ({ meals: null }))
  );

  const responses = await Promise.all(promises);

  responses.forEach((res) => {
    if (!res.meals) return;
    res.meals.forEach((meal) => {
      if (!seen.has(meal.idMeal)) {
        seen.add(meal.idMeal);
        apiResults.push(meal);
      }
    });
  });

  // Fetch full details for first 12 results
  const detailPromises = apiResults.slice(0, 12).map((m) =>
    fetch(`${MEAL_API}/lookup.php?i=${m.idMeal}`)
      .then((r) => r.json())
      .then((d) => (d.meals ? d.meals[0] : null))
      .catch(() => null)
  );

  const details = (await Promise.all(detailPromises)).filter(Boolean);

  // Normalise API meals
  let normalised = details.map(normaliseMealDBRecipe);

  // Mix in local Indian recipes that match ingredients
  const localMatches = filterLocalRecipes(ingredients, state.preference, state.filter);
  const combined = [...localMatches, ...normalised];

  // Filter combined by preference and cuisine filter
  return applyFilters(combined, state.preference, state.filter);
}

/** Convert MealDB structure to our card shape */
function normaliseMealDBRecipe(m) {
  const cats = (m.strCategory || '').toLowerCase();
  let preference = 'vegetarian';
  if (cats.includes('beef') || cats.includes('lamb') || cats.includes('pork') ||
      cats.includes('seafood') || cats.includes('chicken') || cats.includes('goat')) {
    preference = 'non-vegetarian';
  } else if (cats.includes('vegan')) {
    preference = 'vegan';
  }

  // Extract ingredients list
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing  = m[`strIngredient${i}`];
    const meas = m[`strMeasure${i}`];
    if (ing && ing.trim()) ingredients.push(`${meas ? meas.trim() + ' ' : ''}${ing.trim()}`);
  }

  return {
    idMeal:        m.idMeal,
    strMeal:       m.strMeal,
    strCategory:   m.strCategory || 'Indian',
    strArea:       m.strArea || 'Indian',
    strMealThumb:  m.strMealThumb,
    strInstructions: m.strInstructions,
    strYoutube:    m.strYoutube,
    tags:          (m.strTags || '').toLowerCase(),
    preference,
    time:          estimateCookTime(m.strInstructions),
    desc:          (m.strInstructions || '').split('.')[0].trim().slice(0, 120) + '…',
    ingredients,
    region:        guessRegion(m),
  };
}

/** Guess cuisine region from meal data */
function guessRegion(m) {
  const area  = (m.strArea || '').toLowerCase();
  const tags  = (m.strTags || '').toLowerCase();
  const name  = (m.strMeal || '').toLowerCase();

  if (['punjabi', 'butter', 'makhani', 'tandoori', 'biryani'].some((k) => name.includes(k))) return 'north-indian';
  if (['dosa', 'idli', 'sambar', 'rasam', 'pongal', 'upma'].some((k) => name.includes(k))) return 'south-indian';
  if (['gujarati', 'dhokla', 'thepla', 'khakhra'].some((k) => name.includes(k) || tags.includes(k))) return 'gujarati';
  if (['chaat', 'pav', 'bhaji', 'vada', 'kachori'].some((k) => name.includes(k))) return 'street-food';
  if (area === 'indian') return 'north-indian';
  return 'all';
}

/** Quick cook time estimator based on instruction length */
function estimateCookTime(instr) {
  if (!instr) return '30 min';
  const len = instr.length;
  if (len < 500)  return '20 min';
  if (len < 1000) return '35 min';
  if (len < 2000) return '50 min';
  return '60+ min';
}

/** Filter local recipe list */
function filterLocalRecipes(ingredients, preference, filter) {
  return LOCAL_RECIPES.filter((r) => {
    const ingText = (r.ingredients || []).join(' ').toLowerCase() + r.strMeal.toLowerCase() + (r.tags || '');
    const matchedIngredients = ingredients.filter((i) =>
  ingText.includes(i.toLowerCase())
);

const matchCount = matchedIngredients.length;

const matchPercentage =
  matchCount / r.ingredients.length;

const matchesIng =
  matchCount >= 2 ||
  matchPercentage >= 0.4;
    const matchesPref = preference === 'vegetarian'
      ? r.preference === 'vegetarian' || r.preference === 'vegan'
      : preference === 'vegan'
      ? r.preference === 'vegan'
      : true; // non-veg shows all
    const matchesFilter = filter === 'all' || r.region === filter;
    return matchesIng && matchesPref && matchesFilter;
  });
}

/** Apply preference + region filter to a combined list */
function applyFilters(recipes, preference, filter) {
  // Deduplicate
  const seen = new Set();
  const unique = recipes.filter((r) => {
    if (seen.has(r.idMeal)) return false;
    seen.add(r.idMeal);
    return true;
  });

  return unique.filter((r) => {
    const pref = r.preference;
    const matchesPref = preference === 'vegetarian'
      ? pref === 'vegetarian' || pref === 'vegan'
      : preference === 'vegan'
      ? pref === 'vegan'
      : true;
    const matchesFilter = filter === 'all' || r.region === filter;
    return matchesPref && matchesFilter;
  });
}

// ── RENDER RECIPES ─────────────────────────────────────────
function renderRecipes(recipes) {
  recipeGrid.innerHTML = '';
  resultsHeader.style.display = 'flex';

  if (recipes.length === 0) {
    emptyState.style.display = 'block';
    resultsTitle.textContent = 'No Recipes Found';
    resultsCount.textContent = '';
    return;
  }

  emptyState.style.display = 'none';
  resultsTitle.textContent = 'Recipes Found';
  resultsCount.textContent = `${recipes.length} dish${recipes.length > 1 ? 'es' : ''}`;

  recipes.forEach((recipe, idx) => {
    const card = createRecipeCard(recipe, idx);
    recipeGrid.appendChild(card);
  });
}

function createRecipeCard(recipe, idx) {
  const isFav = state.favorites.some((f) => f.idMeal === recipe.idMeal);
  const badgeClass = { vegetarian: 'badge-veg', 'non-vegetarian': 'badge-nonveg', vegan: 'badge-vegan' }[recipe.preference] || 'badge-veg';
  const badgeLabel = { vegetarian: '🥦 Veg', 'non-vegetarian': '🍗 Non-Veg', vegan: '🌱 Vegan' }[recipe.preference] || '🥦 Veg';

  const card = document.createElement('article');
  card.className = 'recipe-card';
  card.style.animationDelay = `${idx * 0.07}s`;

  card.innerHTML = `
    <div class="card-img-wrap">
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&q=80'" />
      <span class="card-badge ${badgeClass}">${badgeLabel}</span>
      <button class="card-fav-btn ${isFav ? 'saved' : ''}" aria-label="Toggle favourite" title="${isFav ? 'Remove from favourites' : 'Add to favourites'}">
        ${isFav ? '❤️' : '🤍'}
      </button>
    </div>
    <div class="card-body">
      <div class="card-cuisine">${recipe.strCategory} · ${recipe.strArea || 'Indian'}</div>
      <h3 class="card-title">${recipe.strMeal}</h3>
      <p class="card-desc">${recipe.desc || recipe.strInstructions?.split('.')[0] || 'A delicious Indian recipe.'}</p>
      <div class="card-meta">
        <span class="card-time">⏱ ${recipe.time}</span>
        <button class="btn-view" data-id="${recipe.idMeal}">View Recipe</button>
      </div>
    </div>
  `;

  // Favourite toggle
  card.querySelector('.card-fav-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavourite(recipe, card.querySelector('.card-fav-btn'));
  });

  // View Recipe
  card.querySelector('.btn-view').addEventListener('click', () => openModal(recipe));

  return card;
}

// ── MODAL ──────────────────────────────────────────────────
function openModal(recipe) {
  const steps = (recipe.strInstructions || 'No instructions available.')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const stepsHtml = steps.length
    ? steps.map((s, i) => `
        <div class="modal-step">
          <span class="step-num">${i + 1}</span>
          <span>${s}</span>
        </div>`).join('')
    : '<div class="modal-step"><span class="step-num">1</span><span>No step-by-step instructions available for this recipe.</span></div>';

  const ingsHtml = (recipe.ingredients || [])
    .map((i) => `<span class="ingredient-pill">${i}</span>`)
    .join('');

  const ytLink = recipe.strYoutube
    ? `<a class="modal-yt-link" href="${recipe.strYoutube}" target="_blank" rel="noopener">▶ Watch on YouTube</a>`
    : '';

  modalContent.innerHTML = `
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" onerror="this.src='https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&q=80'" />
    <div class="modal-body">
      <div class="modal-tag-row">
        <span class="modal-tag">${recipe.strCategory}</span>
        <span class="modal-tag">${recipe.strArea || 'Indian'}</span>
        <span class="modal-tag">⏱ ${recipe.time}</span>
      </div>
      <h2 class="modal-title">${recipe.strMeal}</h2>
      <p class="modal-subtitle">${recipe.desc || ''}</p>

      <div class="modal-section-title">Ingredients</div>
      <div class="modal-ingredients">${ingsHtml || '<span class="ingredient-pill">See full recipe</span>'}</div>

      <div class="modal-section-title">Instructions</div>
      <div class="modal-instructions">${stepsHtml}</div>
      ${ytLink}
    </div>
  `;

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ── FAVOURITES ─────────────────────────────────────────────
function toggleFavourite(recipe, btn) {
  const idx = state.favorites.findIndex((f) => f.idMeal === recipe.idMeal);
  if (idx > -1) {
    state.favorites.splice(idx, 1);
    btn.textContent = '🤍';
    btn.classList.remove('saved');
    showToast('Removed from favourites', 'warning');
  } else {
    state.favorites.push(recipe);
    btn.textContent = '❤️';
    btn.classList.add('saved');
    showToast('Saved to favourites ❤️', 'success');
  }
  localStorage.setItem('bb_favorites', JSON.stringify(state.favorites));
  renderFavorites();
}

function renderFavorites() {
  favGrid.innerHTML = '';
  if (state.favorites.length === 0) {
    favGrid.appendChild(favEmpty);
    favEmpty.style.display = 'block';
    return;
  }
  favEmpty.style.display = 'none';
  state.favorites.forEach((recipe, idx) => {
    const card = createRecipeCard(recipe, idx);
    favGrid.appendChild(card);
  });
}

// ── RECENT SEARCHES ────────────────────────────────────────
function saveRecent(query) {
  state.recents = [query, ...state.recents.filter((r) => r !== query)].slice(0, MAX_RECENTS);
  localStorage.setItem('bb_recents', JSON.stringify(state.recents));
  renderRecents();
}

function renderRecents() {
  recentsList.innerHTML = '';
  if (state.recents.length === 0) {
    recentsList.innerHTML = '<p class="empty-recents">No recent searches yet.</p>';
    return;
  }
  state.recents.forEach((q) => {
    const pill = document.createElement('button');
    pill.className = 'recent-pill';
    pill.innerHTML = `🔍 ${q}`;
    pill.addEventListener('click', () => {
      // Load this search
      state.ingredients = q.split(',').map((s) => s.trim());
      renderTags();
      handleSearch();
    });
    recentsList.appendChild(pill);
  });
}

// ── SURPRISE ME ────────────────────────────────────────────
async function handleSurprise() {
  showLoading(true);
  document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
  try {
    // Pick a random Indian keyword
    const keyword = INDIAN_KEYWORDS[Math.floor(Math.random() * INDIAN_KEYWORDS.length)];
    const res = await fetch(`${MEAL_API}/filter.php?i=${keyword}`);
    const data = await res.json();
    if (!data.meals || data.meals.length === 0) throw new Error('No results');

    // Pick a random meal from results
    const randomMeal = data.meals[Math.floor(Math.random() * Math.min(data.meals.length, 10))];
    const detail = await fetch(`${MEAL_API}/lookup.php?i=${randomMeal.idMeal}`).then((r) => r.json());
    if (!detail.meals) throw new Error('No detail');

    const recipe = normaliseMealDBRecipe(detail.meals[0]);
    state.recipes = [recipe];
    renderRecipes([recipe]);
    showToast(`🎲 Surprise! Try ${recipe.strMeal}`, 'success');
  } catch {
    // Fallback to random local recipe
    const local = LOCAL_RECIPES[Math.floor(Math.random() * LOCAL_RECIPES.length)];
    state.recipes = [local];
    renderRecipes([local]);
    showToast(`🎲 Surprise! Try ${local.strMeal}`, 'success');
  } finally {
    showLoading(false);
  }
}

// ── LOADING ────────────────────────────────────────────────
function showLoading(on) {
  spinnerWrap.style.display   = on ? 'block' : 'none';
  emptyState.style.display    = 'none';
  searchBtn.disabled          = on;
  searchBtn.querySelector('.btn-text').style.display   = on ? 'none' : 'inline';
  searchBtn.querySelector('.btn-loader').style.display = on ? 'inline' : 'none';
  if (on) recipeGrid.innerHTML = '';
}

// ── CLEAR ──────────────────────────────────────────────────
function handleClear() {
  state.ingredients = [];
  renderTags();
  recipeGrid.innerHTML = '';
  resultsHeader.style.display = 'none';
  emptyState.style.display = 'none';
  ingredientInput.value = '';
  showToast('Cleared! Start fresh 🍽️', 'warning');
}

// ── TOAST NOTIFICATIONS ─────────────────────────────────────
function showToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', warning: '⚠️', error: '❌' };
  toast.innerHTML = `<span>${icons[type] || '💬'}</span><span>${msg}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.35s ease forwards';
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// ── NAVBAR SCROLL SHADOW ───────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = $('navbar');
  if (window.scrollY > 20) {
    nav.style.boxShadow = '0 4px 20px rgba(107,63,30,0.12)';
  } else {
    nav.style.boxShadow = 'none';
  }
});

// ── START ──────────────────────────────────────────────────
init(); 