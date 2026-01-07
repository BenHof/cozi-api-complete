# Cozi API Scan Report

**Scan Date:** 2026-01-07T05:29:14.942Z
**Account ID:** a2e52256-6f35-4f4a-b158-e3e1f96e387d

## Summary

- **Total Tested:** 56
- **Successful:** 10
- **Failed:** 46

## Working Endpoints

| Name | Method | Version | Response Keys |
|------|--------|---------|---------------|
| Account Info | GET | v2004 | accountId, cobrand, creationDate, name, colorIndex, timezone, regionDesignator, languageDesignator, analyticsOn, signupSource, photo |
| Account Person List | GET | v2004 | accountPersonId, accountPersonType, version, notifiableFeatures, isAdult, accountCreator, emailStatus, notifiable, colorIndex, email, name, settings, phoneNumberKey |
| Subscription | GET | v2004 | subscriptionStatus, providerSubscriptionId, subscriptionStartDate, subscriptionEndDate, subscriptionId, inTrial, subscriptionProduct, productProvider, providerUrl, entitlementId, renewing, statusPendingConfirmation, latestPaymentDate, concluded, nextPaymentDate, paymentMethod, subscriptionAmount |
| Subscription Products | GET | v2004 | premiumBundleId, products, offeringUrl, termsOfUseUrl, couponData |
| Config | GET | v2004 | features, featureKeys, featureConfig, feature.Meals, app, skin, feature.AllowedRecipeTags, feature.Advertising, feature.Marketing, feature.CoziToday |
| Lists | GET | v2004 | title, items, listId, listType, notes, owner, version |
| Calendar Current Month | GET | v2004 | endDate, startDate, items, days |
| Recipes | GET | v2103 | - |
| Curated Recipes | GET | v2103 | description, instructions, name, nutrition, cookTimeText, servingSize, servings, sourceRaw, sourceUrl, sourceUrlText, sourceLogoUrl, isPublished, tags, recipeId, ingredients, photos |
| User Settings | GET | v2106 | users |

## Failed Endpoints (404/403)

These endpoints did not exist or required different permissions:

- ❌ Calendar Search (GET)
- ❌ Birthdays List (GET)
- ❌ Birthdays v2 (GET)
- ❌ Birthdays v3 (GET)
- ❌ Chores (GET)
- ❌ Chores v2 (GET)
- ❌ Chores v3 (GET)
- ❌ Meals (GET)
- ❌ Meals v2 (GET)
- ❌ Meal Plan (GET)
- ❌ Meal Plan v2 (GET)
- ❌ Menu (GET)
- ❌ Menu Weekly (GET)
- ❌ Journal (GET)
- ❌ Journal Entries (GET)
- ❌ Notes (GET)
- ❌ Notes v2 (GET)
- ❌ Messages (GET)
- ❌ Photos (GET)
- ❌ Photos v2 (GET)
- ❌ Media (GET)
- ❌ Activity (GET)
- ❌ Notifications (GET)
- ❌ Notifications v2 (GET)
- ❌ Settings (GET)
- ❌ Preferences (GET)
- ❌ Account Settings (GET)
- ❌ Holidays (GET)
- ❌ Holidays v2 (GET)
- ❌ Import (GET)
- ❌ Google Import (GET)
- ❌ Export (GET)
- ❌ Shopping (GET)
- ❌ Shopping List (GET)
- ❌ Food Items (GET)
- ❌ Food Categories (GET)
- ❌ Meal Plan (2103) (GET)
- ❌ Meal Plan v2 (2103) (GET)
- ❌ Menu (2103) (GET)
- ❌ Menu Weekly (2103) (GET)
- ❌ Grocery List (GET)
- ❌ Pantry (GET)
- ❌ Account Settings (2106) (GET)
- ❌ Preferences (2106) (GET)
- ❌ Notification Settings (GET)
- ❌ Iterable Config (GET)
