<summary_title>
Professional Model Profile Page Design
</summary_title>

<image_analysis>
1. Content Structure:
- Main Content Elements: Profile photo, personal info section, values/goals section, photo gallery
- Content Grouping: Information organized in distinct card-like sections
- Visual Hierarchy: Large profile photo > Name/Title > Location > About > Values > Gallery
- Content Types: Images, text blocks, tags/badges, interactive buttons
- Text Elements: Name heading, professional title, location, about text, section headers, tag labels

2. Layout Structure:
- Content Distribution: Single column vertical layout with full-width sections
- Spacing Patterns: Consistent padding between sections, uniform margins
- Container Structure: Rounded corner containers for different content blocks
- Grid/Alignment: Gallery uses 2x3 grid for photos
- Responsive Behavior: Single column layout suggests mobile-first design

3. UI Components (Page-Specific):
- Content Cards: Profile info card, about section card, gallery card
- Interactive Elements: "Read more" link, value tags, gallery navigation
- Data Display Elements: Location indicator, professional status
- Status Indicators: Selected/unselected value tags
- Media Components: Profile photo display, gallery photo grid

4. Interactive Patterns:
- Content Interactions: Tappable tags, expandable "Read more" text
- State Changes: Active/inactive states for value tags
- Dynamic Content: Gallery navigation and photo loading
- Mobile Interactions: Touch-friendly spacing for buttons and gallery

</image_analysis>

<development_planning>
1. Component Structure:
- ProfileHeader component (photo, name, title)
- LocationInfo component
- AboutSection with expandable text
- ValuesTagGroup component
- PhotoGallery component with grid layout
- Navigation bar component

2. Content Layout:
- Flexbox for vertical content stacking
- CSS Grid for photo gallery
- Responsive padding/margin system
- Dynamic text truncation for about section

3. Integration Points:
- Theme colors (pink accent, dark text)
- Typography system integration
- Shared button/tag components
- Image lazy loading implementation

4. Performance Considerations:
- Progressive image loading for gallery
- Optimized image delivery
- Minimal layout shifts during loading
- Efficient state management for interactive elements
</development_planning>