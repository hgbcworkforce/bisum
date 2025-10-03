# Speakers Data Module

This directory contains the centralized data for all BISUM Conference 2025 speakers.

## Files

- `speakersData.js` - Main data file containing all speaker information and helper functions

## Usage

### Basic Import

```javascript
import { speakersData, speakerCategories } from "../data/speakersData";
```

### Available Exports

#### Data Arrays
- `speakersData` - Array of all speaker objects
- `speakerCategories` - Array of available speaker categories

#### Helper Functions
- `getFeaturedSpeakers()` - Returns only featured speakers
- `getSpeakersByCategory(category)` - Filters speakers by category
- `searchSpeakers(searchTerm)` - Searches speakers by name, title, company, or expertise
- `filterAndSearchSpeakers(category, searchTerm)` - Combines filtering and searching

### Speaker Object Structure

Each speaker object contains:

```javascript
{
  id: number,                    // Unique identifier
  name: string,                  // Full name
  title: string,                 // Job title
  company: string,               // Company/organization
  bio: string,                   // Detailed biography (supports \n for line breaks)
  image: string,                 // Profile image URL
  expertise: string[],           // Array of expertise areas
  category: string,              // Speaker category (keynote, workshop, panel, technical)
  featured?: boolean,            // Optional: if speaker is featured on homepage
  experience: string,            // Brief experience summary
  achievements: string[],        // Array of key achievements
  session: {                     // Session information
    title: string,               // Session title
    time: string,                // Session time
    venue: string                // Venue location
  },
  social: {                      // Social media links (all optional)
    linkedin?: string,
    twitter?: string,
    website?: string
  },
  quote?: string                 // Optional inspirational quote
}
```

### Examples

#### Get all speakers
```javascript
import { speakersData } from "../data/speakersData";
const allSpeakers = speakersData;
```

#### Get featured speakers for homepage
```javascript
import { getFeaturedSpeakers } from "../data/speakersData";
const featuredSpeakers = getFeaturedSpeakers();
```

#### Filter by category
```javascript
import { getSpeakersByCategory } from "../data/speakersData";
const keynoteSpeakers = getSpeakersByCategory("keynote");
const workshopSpeakers = getSpeakersByCategory("workshop");
```

#### Search speakers
```javascript
import { searchSpeakers } from "../data/speakersData";
const aiSpeakers = searchSpeakers("artificial intelligence");
```

#### Combined filter and search
```javascript
import { filterAndSearchSpeakers } from "../data/speakersData";
const results = filterAndSearchSpeakers("workshop", "mobile");
```

## Speaker Categories

- `all` - All speakers
- `keynote` - Keynote speakers
- `workshop` - Workshop leaders
- `panel` - Panel participants
- `technical` - Technical session speakers

## Adding New Speakers

To add a new speaker:

1. Open `speakersData.js`
2. Add a new speaker object to the `speakersData` array
3. Ensure the `id` is unique and incremented
4. Include all required fields
5. Set `featured: true` if the speaker should appear on the homepage
6. Choose the appropriate `category`

## Modifying Existing Speakers

All speaker modifications should be made in `speakersData.js`. The changes will automatically be reflected across all components that import this data.

## Best Practices

1. **Consistent Image Sizes**: Use images with consistent aspect ratios (preferably 400x400px)
2. **Bio Formatting**: Use `\n\n` for paragraph breaks in bio text
3. **Expertise Tags**: Keep expertise tags concise and relevant
4. **Social Links**: Include full URLs with https://
5. **Quotes**: Keep quotes inspiring and relevant to their expertise

## Components Using This Data

- `pages/Speakers.jsx` - Main speakers page
- `components/SpeakersSection.jsx` - Homepage speakers section
- `components/SpeakerCard.jsx` - Individual speaker cards
- `components/SpeakerModal.jsx` - Speaker detail modal