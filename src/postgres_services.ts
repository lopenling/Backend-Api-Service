import { Pool, Client } from "pg";
import {  sessionVariableFormat } from "./interface";

// Database connection configuration

  function creatPoolClient() {
    const pool = new Pool({
      connectionString: process.env.PG_CONNECTION_STRING
    });
    return pool
  }
  
  export async function addWordDescriptions (inputVariable: (string | number)[][], session: sessionVariableFormat): Promise<any>{
    const batchSize = 1000;
    const batches = []
    let affected_rows = 0;
    //split values into batches
    for(let i = 0 ; i < inputVariable.length; i+= batchSize) {
      batches.push(inputVariable.slice(i, i + batchSize))
    }
    //execute all batches at a time
    const promises = batches.map((batch) => batchProcessor(batch));
    try {
      const data = await Promise.all(promises);
      console.log("All queries executed successfully.", );
      for(let val of data) {
        affected_rows += val.rowCount
      }
      return affected_rows
    } catch (error) {
      console.log("error : ", error)
    }   
  };

  function batchProcessor(batch:(string | number)[][]) {

    // Remove Null values and setup dynamic placeholder
    // for instances: valuePlaceholder would be ($1,$2,$3,$4,$5,$6,.......)
    const valuePlacehoder = batch
      .filter(item => item[0] != null)
      .map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`)
      .join(", ");
      
      const values = batch.flat();
      const query = `
        WITH input(word, source, description, dictionary_id, last_updated_by, target) AS (
          VALUES ${valuePlacehoder}
        ),
          w AS (
            INSERT INTO data.words (word, language)
            SELECT word, source
            FROM input
            ON CONFLICT DO NOTHING
            RETURNING id , word
        )
        INSERT INTO data.descriptions (word_id, description, dictionary_id, last_updated_by, language)
        SELECT w.id, d.description, d.dictionary_id::UUID, d.last_updated_by::UUID, d.target
        FROM input d
        JOIN w USING (word)
        ON CONFLICT DO NOTHING
        RETURNING word_id, description;
      `
      try {
      return creatPoolClient().query(query, values);
      } catch (error: any) {
        return error;
      }
  }