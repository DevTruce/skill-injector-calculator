//// Preset Variables
// regionId
export const theForge = 10000002;

// systemId
export const jita = 30000142;

// itemId
export const smallSkillInjector = 45635;
export const largeSkillInjector = 40520;

//// Calculate Average Sell Value for Item Via ESI
export async function fetchMarketValue(regionId, itemId, type) {
  try {
    const url = `https://esi.evetech.net/latest/markets/${regionId}/orders/?type_id=${itemId}&order_type=${type}`;

    const response = await fetch(url, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const averageSellPrice = Math.round(
      data
        .filter(data => data.price)
        .map(data => data.price)
        .reduce((acc, price, i) => acc + price / data.length, 0)
    );

    console.log("Successfully fetched average sell price");
    return averageSellPrice;
  } catch (error) {
    console.log(
      `Failed to fetch average sell price: defaulting to preset value`
    );
  }
}
