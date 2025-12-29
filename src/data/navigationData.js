export const navigationData = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    subItems: []
  },
  {
    id: 'about',
    label: 'About',
    path: '/about',
    subItems: [
      { id: 'history', label: 'College History', path: '/about/history' },
      { id: 'mission', label: 'Mission & Vision', path: '/about/mission' },
      { id: 'facilities', label: 'Facilities', path: '/about/facilities' },
      { id: 'achievements', label: 'Achievements', path: '/about/achievements' }
    ]
  },
  {
    id: 'academic',
    label: 'Academic',
    path: '/academic',
    subItems: [
      { id: 'programs', label: 'Programs', path: '/academic/programs' },
      { id: 'departments', label: 'Departments', path: '/academic/departments' },
      { id: 'syllabus', label: 'Syllabus', path: '/academic/syllabus' },
      { id: 'calendar', label: 'Academic Calendar', path: '/academic/calendar' }
    ]
  },
  {
    id: 'administration',
    label: 'Administration',
    path: '/administration',
    subItems: [
      { id: 'principal', label: 'Principal', path: '/administration/principal' },
      { id: 'teachers', label: 'Teachers', path: '/administration/teachers' },
      { id: 'staff', label: 'Staff', path: '/administration/staff' },
      { id: 'governing', label: 'Governing Body', path: '/administration/governing' }
    ]
  },
  {
    id: 'admission',
    label: 'Admission',
    path: '/admission',
    subItems: [
      { id: 'procedure', label: 'Admission Procedure', path: '/admission/procedure' },
      { id: 'requirements', label: 'Requirements', path: '/admission/requirements' },
      { id: 'apply', label: 'Apply Online', path: '/admission' }
    ]
  },
  {
    id: 'notice',
    label: 'Notice',
    path: '/notice',
    subItems: []
  },
  {
    id: 'gallery',
    label: 'Gallery',
    path: '/gallery',
    subItems: [
      { id: 'photos', label: 'Photo Gallery', path: '/gallery/photos' },
      { id: 'videos', label: 'Video Gallery', path: '/gallery/videos' },
      { id: 'events', label: 'Events', path: '/gallery/events' }
    ]
  },
  {
    id: 'contact',
    label: 'Contact',
    path: '/contact',
    subItems: []
  }
];