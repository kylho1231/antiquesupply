import { INITIAL_DATA, InitialDataState } from './mock-data';

// Upgrade only known demo stock URLs, preserving supplier edits and orders.
export function migrateDemoImages(saved: InitialDataState): InitialDataState {
  return { ...saved,
    products: saved.products.map(product => {
      if (!product.image_urls?.some((src: string) => src.includes('images.unsplash.com'))) return product;
      const seed = INITIAL_DATA.products.find(item => item.id === product.id);
      return { ...product, image_urls: seed?.image_urls || [], is_demo: !!seed };
    }),
    organizations: saved.organizations.map(org => {
      const seed = INITIAL_DATA.organizations.find(item => item.id === org.id);
      return { ...org,
        banner_image: org.banner_image?.includes('images.unsplash.com') ? seed?.banner_image || '' : org.banner_image,
        logo_image: org.logo_image?.includes('images.unsplash.com') ? '' : org.logo_image,
      };
    }),
  };
}
