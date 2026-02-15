import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://malkhanagarcollege.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all governing body members (public)
export const getAllMembers = async () => {
  try {
    const response = await axios.get(`${API_URL}/public/governing-body`);
    return response;
  } catch (error) {
    console.error('Error fetching governing body members:', error);
    // Return mock data for development
    return {
      data: [
        {
          _id: '1',
          name: 'জনাব মোহাম্মদ আলী',
          designation: 'উপজেলা নির্বাহী অফিসার',
          role: 'সভাপতি',
          description: 'পরিচালনা পর্ষদের সভাপতি হিসেবে কলেজের সার্বিক তত্ত্বাবধান এবং নীতি নির্ধারণে নেতৃত্ব প্রদান করেন। তিনি স্থানীয় প্রশাসনের প্রতিনিধি হিসেবে কলেজ ও সরকারের মধ্যে সেতুবন্ধন হিসেবে কাজ করেন।',
          email: 'chairman@governing.edu.bd',
          phone: '01711223344',
          image: { url: '' },
          order: 1
        },
        {
          _id: '2',
          name: 'অধ্যক্ষ (ভারপ্রাপ্ত)',
          designation: 'মালখানগর কলেজ',
          role: 'সদস্য সচিব',
          description: 'পরিচালনা পর্ষদের সকল সভার কার্যবিবরণী সংরক্ষণ এবং সিদ্ধান্ত বাস্তবায়নের দায়িত্ব পালন করেন। তিনি কলেজের দৈনন্দিন কার্যক্রম পরিচালনা এবং পর্ষদের সিদ্ধান্ত বাস্তবায়নে কেন্দ্রীয় ভূমিকা পালন করেন।',
          email: 'principal@malkhangarcollege.edu.bd',
          phone: '01722334455',
          image: { url: '' },
          order: 2
        },
        {
          _id: '3',
          name: 'জনাব আবদুল হামিদ',
          designation: 'উপজেলা শিক্ষা অফিসার',
          role: 'সদস্য',
          description: 'শিক্ষা মন্ত্রণালয়ের প্রতিনিধি হিসেবে শিক্ষার মান নিয়ন্ত্রণ ও উন্নয়নে পরামর্শ প্রদান করেন। তিনি সরকারি শিক্ষা নীতি বাস্তবায়ন এবং একাডেমিক মান উন্নয়নে গুরুত্বপূর্ণ ভূমিকা রাখেন।',
          email: 'hamid@education.gov.bd',
          phone: '01733445566',
          image: { url: '' },
          order: 3
        },
        {
          _id: '4',
          name: 'জনাব কামরুল ইসলাম',
          designation: 'স্থানীয় সংসদ সদস্য প্রতিনিধি',
          role: 'সদস্য',
          description: 'সংসদ সদস্যের পক্ষ থেকে কলেজের উন্নয়ন কার্যক্রমে সহায়তা এবং তত্ত্বাবধান করেন। কলেজের অবকাঠামো উন্নয়ন এবং সরকারি সহায়তা প্রাপ্তিতে তার ভূমিকা অপরিসীম।',
          email: 'kamrul@parliament.gov.bd',
          phone: '01744556677',
          image: { url: '' },
          order: 4
        },
        {
          _id: '5',
          name: 'জনাব মোঃ রফিকুল ইসলাম',
          designation: 'অভিভাবক প্রতিনিধি',
          role: 'সদস্য',
          description: 'শিক্ষার্থীদের অভিভাবকদের পক্ষ থেকে কলেজের নীতি নির্ধারণে মতামত প্রদান করেন। তিনি অভিভাবক-কলেজ সংযোগ স্থাপনে এবং শিক্ষার্থীদের সমস্যা সমাধানে কাজ করেন।',
          email: 'rofiq@parent.com',
          phone: '01755667788',
          image: { url: '' },
          order: 5
        },
        {
          _id: '6',
          name: 'জনাবা সালেহা বেগম',
          designation: 'মহিলা প্রতিনিধি',
          role: 'সদস্য',
          description: 'মহিলা শিক্ষার্থীদের স্বার্থ রক্ষা এবং তাদের সমস্যা সমাধানে বিশেষ ভূমিকা পালন করেন। তিনি নারী শিক্ষা উন্নয়ন এবং নিরাপদ শিক্ষার পরিবেশ নিশ্চিতে কাজ করেন।',
          email: 'saleha@women.org',
          phone: '01766778899',
          image: { url: '' },
          order: 6
        },
        {
          _id: '7',
          name: 'অধ্যাপক ড. মাহমুদুল হাসান',
          designation: 'শিক্ষক প্রতিনিধি',
          role: 'সদস্য',
          description: 'শিক্ষকমণ্ডলীর পক্ষ থেকে শিক্ষা কার্যক্রম ও একাডেমিক বিষয়ে পরামর্শ প্রদান করেন। তিনি শিক্ষা পদ্ধতি উন্নয়ন এবং শিক্ষকদের কল্যাণে কাজ করেন।',
          email: 'mahmud@teacher.edu.bd',
          phone: '01777889900',
          image: { url: '' },
          order: 7
        },
        {
          _id: '8',
          name: 'জনাব হাজী আবদুল করিম',
          designation: 'স্থানীয় শিক্ষানুরাগী',
          role: 'সদস্য',
          description: 'কলেজের প্রতিষ্ঠাতা সদস্য এবং দীর্ঘদিন ধরে শিক্ষা উন্নয়নে অবদান রেখে চলেছেন। তিনি স্থানীয় সমাজের সাথে কলেজের সম্পর্ক উন্নয়নে গুরুত্বপূর্ণ ভূমিকা পালন করেন।',
          email: 'karim@community.org',
          phone: '01788990011',
          image: { url: '' },
          order: 8
        },
        {
          _id: '9',
          name: 'জনাব নাজমুল হুদা',
          designation: 'ব্যবসায়ী প্রতিনিধি',
          role: 'সদস্য',
          description: 'স্থানীয় ব্যবসায়ী সমাজের পক্ষ থেকে কলেজের আর্থিক ও অবকাঠামো উন্নয়নে সহায়তা করেন। তিনি কলেজের আর্থিক স্বচ্ছতা এবং সম্পদ ব্যবস্থাপনায় পরামর্শ দেন।',
          email: 'nazmul@business.com',
          phone: '01799001122',
          image: { url: '' },
          order: 9
        }
      ]
    };
  }
};

// Get member by ID
export const getMemberById = async (id) => {
  try {
    const response = await api.get(`/governing-body/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Create member (admin only)
export const createMember = async (memberData) => {
  try {
    const response = await api.post('/governing-body', memberData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Update member (admin only)
export const updateMember = async (id, memberData) => {
  try {
    const response = await api.put(`/governing-body/${id}`, memberData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete member (admin only)
export const deleteMember = async (id) => {
  try {
    const response = await api.delete(`/governing-body/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember
};
