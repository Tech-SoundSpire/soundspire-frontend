// src/lib/locationData.ts



// Interface for country with cities
interface CountryWithCities {
    name: string;
    code: string;
    cities: string[];
  }
  
  // Dataset of countries with major cities
  // This can be expanded as needed for a production application
  export const countriesWithCities: CountryWithCities[] = [
    {
      name: 'United States',
      code: 'US',
      cities: [
        'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 
        'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 
        'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco', 
        'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Boston'
      ]
    },
    {
      name: 'India',
      code: 'IN',
      cities: [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 
        'Kolkata', 'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow', 
        'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 
        'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana'
      ]
    },
    {
      name: 'United Kingdom',
      code: 'GB',
      cities: [
        'London', 'Birmingham', 'Manchester', 'Glasgow', 'Newcastle', 
        'Liverpool', 'Leeds', 'Bristol', 'Sheffield', 'Edinburgh', 
        'Cardiff', 'Belfast', 'Leicester', 'Aberdeen', 'Dundee', 
        'Brighton', 'Cambridge', 'Oxford', 'York', 'Southampton'
      ]
    },
    {
      name: 'Canada',
      code: 'CA',
      cities: [
        'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 
        'Ottawa', 'Quebec City', 'Winnipeg', 'Hamilton', 'Kitchener', 
        'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 
        'Saskatoon', 'Regina', 'St. John\'s', 'Kelowna', 'Barrie'
      ]
    },
    {
      name: 'Australia',
      code: 'AU',
      cities: [
        'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide',
        'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Logan City',
        'Geelong', 'Hobart', 'Townsville', 'Cairns', 'Darwin',
        'Toowoomba', 'Ballarat', 'Bendigo', 'Launceston', 'Mackay'
      ]
    },
    {
      name: 'Germany',
      code: 'DE',
      cities: [
        'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt',
        'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen',
        'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg',
        'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster'
      ]
    },
    {
      name: 'France',
      code: 'FR',
      cities: [
        'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice',
        'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille',
        'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon',
        'Angers', 'Grenoble', 'Dijon', 'Nîmes', 'Aix-en-Provence'
      ]
    },
    {
      name: 'Japan',
      code: 'JP',
      cities: [
        'Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo',
        'Kobe', 'Kyoto', 'Fukuoka', 'Kawasaki', 'Saitama',
        'Hiroshima', 'Sendai', 'Kitakyushu', 'Chiba', 'Sakai',
        'Niigata', 'Hamamatsu', 'Kumamoto', 'Sagamihara', 'Shizuoka'
      ]
    },
    {
      name: 'Brazil',
      code: 'BR',
      cities: [
        'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza',
        'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
        'Belém', 'Goiânia', 'Guarulhos', 'Campinas', 'São Luís',
        'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Natal', 'Campo Grande'
      ]
    },
    {
      name: 'China',
      code: 'CN',
      cities: [
        'Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chongqing',
        'Tianjin', 'Wuhan', 'Dongguan', 'Chengdu', 'Nanjing',
        'Shenyang', 'Hangzhou', 'Xi\'an', 'Harbin', 'Suzhou',
        'Qingdao', 'Dalian', 'Jinan', 'Zhengzhou', 'Changsha'
      ]
    }
  ];