export function buildUpdateQuery(
  tableName: string,
  fields: Record<string, unknown>,
  id: string | number
) {
  const fieldsValues = [id] as unknown[];
  let current = 2;

  let q = `UPDATE ${tableName} SET`;

  for (const [key, value] of Object.entries(fields)) {
    if (current > 2) q += ",";

    q += ` ${key} = $${current}`;

    current += 1;
    fieldsValues.push(value);
  }

  q += " WHERE id = $1 RETURNING *";

  return { query: q, fields: fieldsValues };
}
