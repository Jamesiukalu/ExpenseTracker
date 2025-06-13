// Comprehensive category list for the finance tracking application
export const EXPENSE_CATEGORIES = [
  // Housing
  "Rent/Mortgage",
  "Property Taxes",
  "Home/Rental Insurance",
  "Repairs & Maintenance",
  "Furniture & Decor",

  // Utilities
  "Electricity",
  "Gas/Oil",
  "Water/Sewer",
  "Internet",
  "Mobile Phone",

  // Food
  "Groceries",
  "Restaurants & Dining Out",
  "Coffee Shops",
  "Meal Kits/Delivery",

  // Transportation
  "Car Payment & Insurance",
  "Gas/Fuel",
  "Maintenance & Repairs",
  "Public Transit (Bus, Subway)",
  "Taxis & Ride-Sharing (Uber, Lyft)",
  "Parking",

  // Healthcare
  "Health Insurance Premiums",
  "Doctor & Dentist Visits",
  "Prescriptions & Medications",
  "Optometrist & Eyewear",

  // Personal Care
  "Haircuts & Salon",
  "Toiletries",
  "Gym Memberships",
  "Cosmetics",

  // Shopping
  "Clothing & Shoes",
  "Electronics",
  "Hobbies & Sporting Goods",
  "Books & Subscriptions",

  // Entertainment
  "Streaming Services (Netflix, Spotify)",
  "Movies & Concerts",
  "Games",
  "Events & Outings",

  // Family & Dependents
  "Childcare/Babysitting",
  "Kids' Activities & Sports",
  "Tuition & School Fees",
  "Pet Food & Supplies",
  "Veterinarian",

  // Financial
  "Debt Payments (Credit Cards, Student Loans)",
  "Savings Contributions",
  "Investment Contributions",
  "Bank Fees",
  "Financial Advisor Fees",

  // Gifts & Donations
  "Charitable Giving",
  "Birthday/Holiday Gifts",

  // Travel
  "Flights",
  "Accommodations (Hotels, Airbnb)",
  "Vacation Spending",

  // Miscellaneous
  "Work-related Expenses",
  "Taxes",
  "Postage & Shipping",
];

// Category groups for better organization
export const CATEGORY_GROUPS = {
  Housing: [
    "Rent/Mortgage",
    "Property Taxes",
    "Home/Rental Insurance",
    "Repairs & Maintenance",
    "Furniture & Decor",
  ],
  Utilities: [
    "Electricity",
    "Gas/Oil",
    "Water/Sewer",
    "Internet",
    "Mobile Phone",
  ],
  Food: [
    "Groceries",
    "Restaurants & Dining Out",
    "Coffee Shops",
    "Meal Kits/Delivery",
  ],
  Transportation: [
    "Car Payment & Insurance",
    "Gas/Fuel",
    "Maintenance & Repairs",
    "Public Transit (Bus, Subway)",
    "Taxis & Ride-Sharing (Uber, Lyft)",
    "Parking",
  ],
  Healthcare: [
    "Health Insurance Premiums",
    "Doctor & Dentist Visits",
    "Prescriptions & Medications",
    "Optometrist & Eyewear",
  ],
  "Personal Care": [
    "Haircuts & Salon",
    "Toiletries",
    "Gym Memberships",
    "Cosmetics",
  ],
  Shopping: [
    "Clothing & Shoes",
    "Electronics",
    "Hobbies & Sporting Goods",
    "Books & Subscriptions",
  ],
  Entertainment: [
    "Streaming Services (Netflix, Spotify)",
    "Movies & Concerts",
    "Games",
    "Events & Outings",
  ],
  "Family & Dependents": [
    "Childcare/Babysitting",
    "Kids' Activities & Sports",
    "Tuition & School Fees",
    "Pet Food & Supplies",
    "Veterinarian",
  ],
  Financial: [
    "Debt Payments (Credit Cards, Student Loans)",
    "Savings Contributions",
    "Investment Contributions",
    "Bank Fees",
    "Financial Advisor Fees",
  ],
  "Gifts & Donations": ["Charitable Giving", "Birthday/Holiday Gifts"],
  Travel: ["Flights", "Accommodations (Hotels, Airbnb)", "Vacation Spending"],
  Miscellaneous: ["Work-related Expenses", "Taxes", "Postage & Shipping"],
};

// Helper function to get category group
export const getCategoryGroup = (category: string): string => {
  for (const [group, categories] of Object.entries(CATEGORY_GROUPS)) {
    if (categories.includes(category)) {
      return group;
    }
  }
  return "Miscellaneous";
};
