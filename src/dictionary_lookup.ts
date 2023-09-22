import * as danfo from "danfojs-node";
import { DataFrame } from "danfojs-node/dist/danfojs-base";
import { dictionaryColFormat, dictionaryDataFormat, dictionaryContentFormat } from "./interface"


class DictionaryLookup {

    constructor(
        readonly selected_dictionary: dictionaryColFormat[],
    ) {}
    
    async loadDictionary():Promise<{dictionary: dictionaryDataFormat, isErrDictionaryLookup: boolean}> {
        try {
            const base_url = 'https://raw.githubusercontent.com/Lotus-King-Research/Padma-Dictionary-Data/main/data/'
            const options: object = {
                delimiter: '\t'
            }
            let dictionary: dictionaryDataFormat = {};
            let df_to_json:object;
            let dfJson_value:dictionaryContentFormat[];

            for (let row of this.selected_dictionary) {
                // reading individual dictionary contents
                
                let df: DataFrame = await danfo.readCSV(`${base_url}${row['Name']}`, options)
                console.log("df", df)
                df_to_json = {...danfo.toJSON(df)}
                dfJson_value = Object.values(df_to_json)
                dictionary[`${row.Title}`]= dfJson_value
                console.log(row['Title'], "download completed")

            }
            return {dictionary, isErrDictionaryLookup: false};
        } catch (err: any) {
            return {dictionary: err, isErrDictionaryLookup: true}
        }
        
    }

}

export default DictionaryLookup;