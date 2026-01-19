/**
 * 获取访问者的地理位置信息
 * 使用多个免费IP地理位置API作为备选
 */

const getLocationFromAPI = async (apiUrl) => {
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Failed to fetch location from API:', error);
    return null;
  }
};

/**
 * 获取访问者的地理位置
 * 尝试多个API以确保可靠性
 */
export const getVisitorLocation = async () => {
  // 优先使用 ipapi.co (免费，无需API key，支持CORS)
  const apis = [
    {
      url: 'https://ipapi.co/json/',
      parser: (data) => ({
        country: data.country_name || data.country || 'Unknown',
        countryCode: data.country_code || 'XX',
        region: data.region || data.region_name || 'Unknown',
        city: data.city || 'Unknown',
        ip: data.ip || 'Unknown'
      })
    },
    {
      url: 'https://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,query',
      parser: (data) => {
        if (data.status === 'success') {
          return {
            country: data.country || 'Unknown',
            countryCode: data.countryCode || 'XX',
            region: data.regionName || data.region || 'Unknown',
            city: data.city || 'Unknown',
            ip: data.query || 'Unknown'
          };
        }
        return null;
      }
    },
    {
      url: 'https://api.ipgeolocation.io/ipgeo?apiKey=free',
      parser: (data) => ({
        country: data.country_name || data.country || 'Unknown',
        countryCode: data.country_code2 || 'XX',
        region: data.state_prov || data.state || 'Unknown',
        city: data.city || 'Unknown',
        ip: data.ip || 'Unknown'
      })
    }
  ];

  // 尝试每个API
  for (const api of apis) {
    try {
      const data = await getLocationFromAPI(api.url);
      if (data) {
        const location = api.parser(data);
        if (location) {
          return location;
        }
      }
    } catch (error) {
      console.warn(`Failed to get location from ${api.url}:`, error);
      continue;
    }
  }

  // 如果所有API都失败，返回默认值
  return {
    country: 'Unknown',
    countryCode: 'XX',
    region: 'Unknown',
    city: 'Unknown',
    ip: 'Unknown'
  };
};

/**
 * 获取地区显示名称（优先显示国家，如果有城市信息也显示）
 */
export const getRegionDisplayName = (location) => {
  if (!location) return 'Unknown';
  
  const { country, city, region } = location;
  
  if (country === 'Unknown') {
    return 'Unknown';
  }
  
  // 如果是中国，显示省份+城市
  if (country === 'China' || country === '中国') {
    if (city && city !== 'Unknown' && city !== region) {
      return `${region || ''}${city}`;
    }
    return region || country;
  }
  
  // 其他国家显示国家名
  return country;
};

