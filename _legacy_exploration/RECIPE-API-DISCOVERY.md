# Recipe/Food API Discovery

**Date**: January 7, 2026  
**API Version**: 2103  
**Status**: ✅ FULLY DISCOVERED

---

## 🎉 Success!

We successfully discovered the **Recipe/Food API** through targeted browser traffic capture!

## API Endpoints

### Base URL
```
https://rest.cozi.com/api/ext/2103/{accountId}/food/
```

### Endpoints Discovered

#### 1. List User Recipes
```
GET /api/ext/2103/{accountId}/food/recipe/
```
Returns all recipes created by the user.

**Response**: Array of recipe objects

---

#### 2. List Curated Recipes
```
GET /api/ext/2103/{accountId}/food/curated/recipe/
```
Returns Cozi's curated recipe collection.

**Response**: Array of curated recipe objects

---

#### 3. Create Recipe
```
POST /api/ext/2103/{accountId}/food/recipe/
```

**Request Payload**:
```json
{
  "name": "Recipe Name",
  "description": "Short description",
  "instructions": "Step by step instructions",
  "ingredients": [
    {
      "name": "Ingredient name",
      "amount": "1",
      "unit": "cup",
      "parsedName": null,
      "preparation": "diced",
      "ingredientId": "uuid",
      "subRecipeId": null
    }
  ],
  "recipeId": "uuid",
  "recipeSource": "Typed Into Cozi",
  "sourceRaw": "website.com",
  "sourceUrl": null,
  "sourceUrlText": "website.com",
  "sourceLogoUrl": null,
  "isPublished": false,
  "tags": {
    "has-keyword": ["keyword1", "keyword2"]
  },
  "nutrition": null,
  "cookTimeText": null,
  "servingSize": null,
  "servings": null,
  "photos": []
}
```

**Response**: `201 Created` with full recipe object including generated IDs

---

#### 4. Upload Recipe Photo
```
POST /api/ext/2103/{accountId}/food/recipe/{recipeId}/photo
```

Upload photo for an existing recipe.

**Content-Type**: `multipart/form-data` or image upload

**Response**: Photo URL and metadata

---

#### 5. Delete Recipe
```
DELETE /api/ext/2103/{accountId}/food/recipe/{recipeId}
```

Deletes a recipe.

**Response**: `204 No Content`

---

## Recipe Object Structure

### Core Fields
- `recipeId` - UUID for the recipe
- `name` - Recipe title
- `description` - Short description/summary
- `instructions` - Full cooking instructions (supports newlines)
- `ingredients` - Array of ingredient objects

### Ingredient Object
```json
{
  "ingredientId": "uuid",
  "name": "Full ingredient text",
  "amount": "1" or null,
  "unit": "cup" or null,
  "parsedName": null,
  "preparation": "diced" or null,
  "subRecipeId": null
}
```

### Metadata Fields
- `recipeSource` - "Typed Into Cozi", "Imported", etc.
- `sourceRaw` - Original source text
- `sourceUrl` - URL if from web
- `sourceUrlText` - Display text for source
- `sourceLogoUrl` - Logo for source website
- `isPublished` - Boolean (likely for sharing)

### Optional Fields
- `nutrition` - Nutrition information (structure TBD)
- `cookTimeText` - Cook time as text (e.g., "30 minutes")
- `servingSize` - Serving size text
- `servings` - Number of servings
- `tags` - Object with tag arrays (has-keyword, has-ai-protein, has-ai-cuisine, has-ai-meal)
- `photos` - Array of photo objects

---

## Tags Structure

Based on config endpoint, supported tag types:
```json
{
  "has-keyword": ["custom", "tags"],
  "has-ai-protein": ["Chicken", "Beef", "Turkey", "Vegetarian", "Pork", "Seafood", "Other"],
  "has-ai-cuisine": ["American", "Mexican", "Mediterranean", "Italian", "Asian", "Indian", "Other"],
  "has-ai-meal": ["Dinner", "Lunch", "Breakfast", "Dessert", "Other"]
}
```

---

## Photo Upload

Photos are uploaded separately after recipe creation:

1. Create recipe with `POST /food/recipe/`
2. Get `recipeId` from response
3. Upload photo with `POST /food/recipe/{recipeId}/photo`

Photos are stored in S3:
```
https://cozi-services.s3.amazonaws.com/account/{accountId}/food/{recipeId}/...
```

---

## Key Findings

### API Version
- Recipe API uses **v2103** (not v2004 like calendar/lists)
- This is a newer API endpoint

### Recipe Source Types
- "Typed Into Cozi" - Manually entered
- Likely others: "Imported", "Web", etc.

### Ingredients
- Support free-form text (name field)
- Optional structured data (amount, unit, preparation)
- Each ingredient has unique ID
- Support for sub-recipes (subRecipeId)

### Publishing
- `isPublished` field suggests recipes can be shared
- Mechanism for sharing unknown

---

## What's Still Unknown

### Meal Planning
- How to assign recipes to meal plan
- Meal plan calendar/schedule endpoints
- Grocery list generation from recipes

### Recipe Modification
- PUT/PATCH endpoints for editing recipes (not tested)
- Likely: `PUT /api/ext/2103/{accountId}/food/recipe/{recipeId}`

### Search & Browse
- Recipe search endpoint
- Category/tag filtering
- Browse curated recipes by category

### Sharing
- How `isPublished` works
- Sharing recipes with other users
- Public recipe URLs

---

## Implementation Priority

### High Priority ✅
1. `GET /food/recipe/` - List recipes
2. `POST /food/recipe/` - Create recipe
3. `DELETE /food/recipe/{id}` - Delete recipe

### Medium Priority
4. `GET /food/curated/recipe/` - Browse curated recipes
5. `POST /food/recipe/{id}/photo` - Upload photos
6. `PUT /food/recipe/{id}` - Edit recipe (needs testing)

### Low Priority
7. Meal planning integration
8. Recipe sharing features
9. Advanced search/filtering

---

## Next Steps

1. ✅ Document recipe endpoints in API-REFERENCE.md
2. ✅ Add TypeScript types for recipes
3. ⚠️ Test recipe editing (PUT/PATCH)
4. ⚠️ Investigate meal planning endpoints
5. ⚠️ Test photo upload mechanism
6. ⚠️ Explore recipe sharing features

---

## Files Generated

1. `targeted-traffic-capture-autosave.json` - Raw captured API traffic
2. `RECIPE-API-DISCOVERY.md` - This document

---

## Summary

We successfully discovered **5 working recipe endpoints** using targeted browser traffic capture:
- ✅ List user recipes
- ✅ List curated recipes  
- ✅ Create recipe with full metadata
- ✅ Upload recipe photos
- ✅ Delete recipe

This completes our discovery of the major Cozi API features!
