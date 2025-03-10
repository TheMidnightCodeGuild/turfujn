import icons from "./icon";
import images from "./images";

export const amenities = [
  {
    title: "Changing Room",
    icon: icons.laundry,
  },
  {
    title: "Parking",
    icon: icons.carPark,
  },
  {
    title: "Training Equipment",
    icon: icons.run,
  },
  {
    title: "Cafeteria",
    icon: icons.cutlery,
  },
  {
    title: "Gym",
    icon: icons.dumbell,
  },
  {
    title: "Water Cooler",
    icon: icons.swim,
  },
  {
    title: "Wifi",
    icon: icons.wifi,
  },
  {
    title: "First Aid",
    icon: icons.info,
  },
];

export const categories = [
  { title: "All", category: "All" },
  { title: "Football", category: "Football" },
  { title: "Cricket", category: "Cricket" },
  { title: "Basketball", category: "Basketball" },
  { title: "Tennis", category: "Tennis" },
  { title: "Volleyball", category: "Volleyball" },
  { title: "Badminton", category: "Badminton" },
  { title: "Others", category: "Others" },
];

export const settings = [
  {
    title: "My Bookings",
    icon: icons.calendar,
  },
  {
    title: "Payments",
    icon: icons.wallet,
  },
  {
    title: "Profile", 
    icon: icons.person,
  },
  {
    title: "Notifications",
    icon: icons.bell,
  },
  {
    title: "Security",
    icon: icons.shield,
  },
  {
    title: "Language",
    icon: icons.language,
  },
  {
    title: "Help Center",
    icon: icons.info,
  },
  {
    title: "Invite Friends",
    icon: icons.people,
  },
];

export const gallery = [
  {
    id: 1,
    image: images.newYork,
  },
  {
    id: 2,
    image: images.japan,
  },
  {
    id: 3,
    image: images.newYork,
  },
  {
    id: 4,
    image: images.japan,
  },
  {
    id: 5,
    image: images.newYork,
  },
  {
    id: 6,
    image: images.japan,
  },
];

export const TIME_SLOTS = [
  { id: "8am-9am", label: "8:00 AM - 9:00 AM", start: 8, end: 9 },
  { id: "9am-10am", label: "9:00 AM - 10:00 AM", start: 9, end: 10 },
  { id: "10am-11am", label: "10:00 AM - 11:00 AM", start: 10, end: 11 },
  { id: "11am-12pm", label: "11:00 AM - 12:00 PM", start: 11, end: 12 },
  { id: "12pm-1pm", label: "12:00 PM - 1:00 PM", start: 12, end: 13 },
  { id: "1pm-2pm", label: "1:00 PM - 2:00 PM", start: 13, end: 14 },
  { id: "2pm-3pm", label: "2:00 PM - 3:00 PM", start: 14, end: 15 },
  { id: "3pm-4pm", label: "3:00 PM - 4:00 PM", start: 15, end: 16 },
  { id: "4pm-5pm", label: "4:00 PM - 5:00 PM", start: 16, end: 17 },
  { id: "5pm-6pm", label: "5:00 PM - 6:00 PM", start: 17, end: 18 },
  { id: "6pm-7pm", label: "6:00 PM - 7:00 PM", start: 18, end: 19 },
  { id: "7pm-8pm", label: "7:00 PM - 8:00 PM", start: 19, end: 20 },
  { id: "8pm-9pm", label: "8:00 PM - 9:00 PM", start: 20, end: 21 },
  { id: "9pm-10pm", label: "9:00 PM - 10:00 PM", start: 21, end: 22 },
  { id: "10pm-11pm", label: "10:00 PM - 11:00 PM", start: 22, end: 23 },
  { id: "11pm-12am", label: "11:00 PM - 12:00 AM", start: 23, end: 24 }
];