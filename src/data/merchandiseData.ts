import { MerchandiseItem } from '../types';

export const merchandiseItems: MerchandiseItem[] = [
  {
    id: 't-shirt',
    name: 'BISUM T-Shirt',
    description: 'High-quality cotton t-shirt with BISUM logo. Available in multiple colors and sizes. Comfortable and stylish for any occasion.',
    price: '₦ 6, 000',
    timeFrame: 'November 14, 2025 23:59:59',
    fullDescription: 'Show your support for the BISUM Conference with this exclusive t-shirt. Made from premium, soft cotton, it offers superior comfort and durability. Features the official BISUM logo prominently. Available in a range of sizes from S to XXL.',
    colors: [
      { name: 'Navy Blue', image: '/merchandise/shirt-nb.webp' },
      { name: 'White', image: '/merchandise/shirt-w.webp' },
      { name: 'Purple', image: '/merchandise/shirt-p.webp' },
      { name: 'Sky Blue', image: '/merchandise/shirt-sb.webp' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'face-cap',
    name: 'BISUM Face Cap',
    description: 'Stylish face cap, perfect for sunny conference days. Adjustable strap.',
    price: '₦ 2, 500',
    timeFrame: 'November 14, 2025 23:59:59',
    fullDescription: 'Complete your conference look with the official BISUM face cap. Designed for comfort and style, it features an adjustable strap for a perfect fit and embroidered BISUM logo. Great for outdoor events or just as a casual accessory.',
    colors: [
      { name: 'Navy Blue', image: '/merchandise/cap-nb.webp' },
      { name: 'White', image: '/merchandise/cap-w.webp' },
      { name: 'Purple', image: '/merchandise/cap-p.webp' },
      { name: 'Sky Blue', image: '/merchandise/cap-sb.webp' },
    ],
    sizes: ['One Size'],
  },
];

export const getMerchandiseItemById = (id: string): MerchandiseItem | undefined => {
  return merchandiseItems.find((item) => item.id === id);
};
