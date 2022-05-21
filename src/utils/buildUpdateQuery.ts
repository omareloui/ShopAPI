export function buildUpdateQuery(
  tableName: string,
  fields: Record<string, unknown>,
  id: string | number
) {
  const fieldsValues = [id] as unknown[];
  let current = 2;

  let q = `UPDATE ${tableName} SET`;

  const fieldsEntries = Object.entries(fields);

  if (!fieldsEntries.length) throw new Error("No fields provided to update.");

  for (const [key, value] of fieldsEntries) {
    if (current > 2) q += ",";

    q += ` ${key} = $${current}`;

    current += 1;
    fieldsValues.push(value);
  }

  q += " WHERE id = $1 RETURNING *";

  return { query: q, fields: fieldsValues };
}
