# Knight RPG Tarot Card Draw

A web-based application for generating and managing character aspects through tarot card draws for a Knight-themed RPG system.

## Overview

This application helps players create characters by randomly drawing tarot cards and selecting various character aspects including advantages, disadvantages, and background elements. It provides a complete character creation interface with save, load, and PDF export capabilities.

## Features

### Core Functionality
- Random drawing of 5 tarot cards from a deck of 22 major arcana
- Selection system for character aspects:
  - 2 Advantages
  - 1 Disadvantage
  - Multiple Past elements
  - Automatic Bonus tracking
- Character name input and tracking
- Complete character data management

### Data Management
- Save character data to JSON file
- Load previously saved character data
- Export character sheet to PDF
- Reset all selections and start over

## Technical Implementation

### File Structure
```
├── index.html
├── style.css
└── script.js
```

### Components

#### HTML Structure
- Character name input field
- Button group for main actions
- Four main sections in a card-column layout:
  - Advantages
  - Disadvantages
  - Pasts
  - Bonuses

#### CSS Features
- Responsive grid layout using CSS Grid
- Mobile-friendly design
- Clean, modern styling with consistent spacing
- Flexible card columns that adjust to screen size

#### JavaScript Functionality

##### Core Data Management
```javascript
// Global state management
let drawnCards = [];
let selectedCards = {
    advantages: [],
    disadvantages: [],
    pasts: [],
    bonuses: []
};
```

##### Main Functions

1. **Card Drawing**
   - `drawCards()`: Randomly selects 5 cards from the deck
   - Clears previous selections
   - Populates UI with new card options

2. **Selection Management**
   - `addCheckbox()`: Creates selectable options for advantages, disadvantages, and pasts
   - `addItem()`: Adds non-selectable bonus items
   - Enforces selection limits (2 advantages, 1 disadvantage)

3. **Save/Load System**
   - `saveCharacter()`: Exports character data to JSON
   - `loadCharacter()`: Imports character data from JSON
   - Includes error handling and validation

4. **PDF Export**
   - `exportToPDF()`: Creates formatted PDF character sheet
   - Includes all selected aspects and character information
   - Handles page breaks and formatting automatically

5. **Reset Functionality**
   - `resetApplication()`: Clears all selections and data
   - Includes confirmation dialog
   - Resets UI to initial state

### Tarot Card Data Structure
```javascript
{
    name: String,          // Card name
    past: String,          // Background element
    bonus: String,         // Automatic bonus
    advantage: String,     // Possible advantage
    disadvantage: String   // Possible disadvantage
}
```

## Usage Instructions

1. **Initial Setup**
   - Enter character name
   - Click "Draw Cards" to get initial options

2. **Making Selections**
   - Select exactly 2 advantages
   - Select 1 disadvantage
   - Select any number of past elements
   - Bonuses are automatically applied

3. **Saving Progress**
   - Click "Save" to export character data
   - Files are saved in JSON format
   - Naming convention: `{character_name}_Tarot_Cards.json`

4. **Loading Characters**
   - Click "Load" to import saved character data
   - Select previously saved JSON file
   - All selections will be restored

5. **Creating Character Sheet**
   - Click "Export to PDF" to generate character sheet
   - PDF includes all selections and character information
   - Naming convention: `{character_name}_Tarot_Card_Draw.pdf`

## Technical Requirements

### Dependencies
- jsPDF library for PDF generation
- Modern web browser with JavaScript enabled
- CSS Grid support

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance Considerations

- Efficient card selection using array manipulation
- Optimized PDF generation for large character sheets
- Responsive design for various screen sizes
- Error handling for all user interactions

## Security Features

- Input sanitization for character names
- Safe file handling for JSON imports
- Validation of loaded character data
- Protected PDF generation process

## Future Enhancement Possibilities

1. **Additional Features**
   - Card visualization
   - Character portrait upload
   - Multiple character management
   - Character sharing capabilities

2. **Technical Improvements**
   - Offline support
   - Local storage backup
   - Custom PDF templates
   - Advanced validation rules

3. **User Experience**
   - Undo/redo functionality
   - Card drawing animations
   - Interactive help system
   - Character creation wizard

## Known Limitations

- Maximum 5 cards per draw
- PDF layout is fixed format
- No automatic card interpretation
- Limited to major arcana cards

## Troubleshooting

### Common Issues
1. **Card Selection Issues**
   - Verify selection limits are not exceeded
   - Check for proper checkbox state
   - Ensure cards are properly drawn

2. **Save/Load Problems**
   - Verify JSON file format
   - Check file permissions
   - Ensure all data is present

3. **PDF Export Issues**
   - Confirm character name is entered
   - Check for selection completeness
   - Verify PDF library is loaded

## Support

For issues or questions:
1. Check known limitations
2. Review troubleshooting guide
3. Verify browser compatibility
4. Check for JavaScript errors in console

