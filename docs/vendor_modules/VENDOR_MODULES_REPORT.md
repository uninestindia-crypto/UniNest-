# Vendor Property & Service Modules Report

## Overview
The UniNest Vendor Module supports four distinct **Property & Service Categories** that allow vendors to manage specific types of businesses. Each category comes with a custom dashboard UI featuring tools tailored to the unique operational needs of that business model. 

The four primary vendor modules are:
1. **Hostel Module**
2. **Library Module**
3. **Food Mess Module**
4. **Cybercafé Module**

Below is a detailed breakdown of the functionality and features built into each specific module.

---

## 1. Hostel Module
The Hostel Module is designed for property owners to manage student accommodations, private rooms, and bed spaces.

### Key Features
- **Room Mix & Occupancy Management**: Vendors can create sub-listings for specific "Hostel Rooms", specifying the room name, bed capacity (e.g., Single, Double Sharing), and price. 
- **Booking Funnel**: Tracks tenant interest through a funnel (Approved, Pending, Rejected) calculating conversion rates and total revenue.
- **Tenant Management**: Vendors can review pending booking requests and approve/reject them. Approvals log the student into the active tenant roster.
- **Utilities & House Rules**: A dedicated section to list included utilities (Wi-Fi, laundry, meals) and outline house rules (e.g., curfews, visitor policies) to set expectations upfront.
- **Financial Statistics**: Tracks unique tenants, total all-time revenue, average ticket size, and a weekly booking trend chart.

---

## 2. Library Module
The Library Module caters to independent study spaces and reading rooms catering to students who need dedicated quiet hours or reserved seating.

### Key Features
- **Seat Inventory Management**: Tracks the total number of physical seats available in the library versus seats currently booked by active memberships, displaying real-time availability.
- **Shift & Opening Hours Management**: Allows vendors to configure shift timings (e.g., Morning, Evening, Night sets) which students select when applying for a seat.
- **Monthly Subscription Approvals**: Vendors review incoming requests for seat reservations, approving or rejecting students based on shift availability and total capacity.
- **Amenities Showcase**: A specialized section to highlight facilities crucial for study spaces, such as AC, High-Speed Wi-Fi, Ergonomic Chairs, and Charging Ports.

---

## 3. Food Mess Module
The Food Mess Module is tailored for local tiffin services, canteen operators, and meal subscription providers.

### Key Features
- **Daily Meal Plan Cycle**: The dashboard prominently features the current menu cycle (Breakfast, Lunch, Dinner items), allowing vendors to update their offerings so students know exactly what they are subscribing to.
- **Menu Item Pricing (A La Carte)**: In addition to subscriptions, vendors can list individual dishes with specific prices and manage them directly from a table on the dashboard.
- **Subscriber & Order Tracking**: Focuses heavily on tracking "Active Orders" (recurring diners) and recent individual food orders with statuses (Ready, Pending, Delivered).
- **Dietary & Delivery Policies**: Space to provide "Special Notes" regarding hygiene commitments, vegetarian/non-vegetarian segregation, and delivery timings.

---

## 4. Cybercafé Module
The Cybercafé module is built for gaming lounges, printing shops, and shared computer workstations.

### Key Features
- **Rate Plans & Services**: Vendors can construct hourly pricing tiers (e.g., Basic Browsing vs. Premium Gaming PC) and manage a list of services offered (Printing, Scanning, Console Gaming).
- **Equipment Specifications**: A dedicated field for vendors to detail their hardware specs (GPU, Monitor refresh rates, peripherals) to attract specific crowds like e-sports teams or freelancers.
- **Hourly Booking Slots**: Manages availability windows that customers can book to secure a workstation ahead of time.
- **Peak Usage Insights**: Displays a bar chart outlining hourly foot traffic (e.g., 10 AM to 6 PM) helping vendors anticipate rush hours and manage walk-ins versus reservations.

---

## Common Shared Features
Across all four modules, the system shares several standardized conversion metrics:
- **Booking Funnel Analytics**: Every dashboard computes Approved vs. Pending vs. Rejected orders, providing a clear Conversion Rate percentage.
- **Financial Tracking**: Total Revenue, Average Ticket Size, and Weekly Order/Approval Trends are visualized using interactive charts.
- **Direct Communication Channels**: Emphasizes quick contact by prompting vendors to link a direct Phone Number and WhatsApp Number to their listings.

---

## Audit Findings: Functionality & Responsiveness

After a comprehensive codebase review to evaluate the practical implementation status of the vendor module, the following observations were recorded:

### 1. Functional Features (Working Correctly)
- **Core Order Integration**: Real-time integration with Supabase exists. Approving or rejecting orders (`handleApproval` function) actively updates the `orders` database table on both the web dashboards and the mobile app.
- **Analytics Engine**: The Booking Funnel calculates real values. Utilities like `computeConversionStats` and `buildWeeklyOrderTrend` dynamically react to the fetched vendor orders rather than using dummy data.
- **Mobile Native Vendor App**: The Expo app features a unified, fully working vendor dashboard (`apps/mobile/app/vendor/dashboard.tsx`). It calculates total sales, shows real active listings (`listings.tsx`), tracks pending orders with badges, and operates smoothly.

### 2. Broken or "Coming Soon" Features
While the core ordering works, some advanced modular features are incomplete:
- **Library Module**: The "Memberships" tracking pane is a generic placeholder (`<p>Membership feature coming soon!</p>`).
- **Food Mess Module**: The "Subscriptions" block is also a placeholder (`<p>Subscription feature coming soon!</p>`).
- **Cybercafé Module**: The "Peak Usage Hours" bar chart is entirely hardcoded dummy data (`usageData` array mapping hours to arbitrary user counts).

### 3. Responsive Design & Layout Check (User-Friendliness)
- **Web Layout on Mobile Browsers**: 
  - The web dashboards are styled with responsive Tailwind CSS (`grid lg:grid-cols-2`, `lg:grid-cols-3`). This implies that on mobile devices, grids natively collapse into vertical stacks (1-column layout), preventing horizontal squishing.
  - Analytics charts are fully wrapped in `<ResponsiveContainer width="100%">`, so they scale properly. 
  - Tables (like order approvals) are standard layout components. *Caution: Tables with many columns may cause slight horizontal scrolling within their containers on very small screens, but they will not overflow the entire layout page.*
- **Mobile App Native UI**:
  - The React Native mobile interfaces do not suffer from overflow issues. Text elements that could be extremely long (like product titles) are safely truncated using `numberOfLines={1}`.
  - Proper use of Flexbox rows and `ScrollView`/`FlatList` ensures the app natively scrolls instead of abruptly breaking or cutting off components.
