interface sessionVariableFormat {
    "x-hasura-role": string,
    [key: string]: string
}

// Type defination of hasura input data : 
interface hasuraDataFormat {
    readonly name: string,
    readonly target: string,
    readonly source: string,
    readonly access_mode: string
    readonly organization_id: string
}

// format and type of dictionaries
interface dictionaryColFormat {
    Name: string,
    Title: string,
    Label: string
}

// Format and type of dictionary content
interface dictionaryContentFormat { 
    Tibetan: string, 
    Description: string
}


interface dictionaryDataFormat {
    [key: string]: dictionaryContentFormat[]
}

interface wordDescriptionFormat {
    word : string;
    source: string,
    description: string,
    dictionary_id: string | number,
    last_updated_by: string | number,
    target: string

}

export {
    dictionaryColFormat, 
    hasuraDataFormat, 
    dictionaryDataFormat, 
    dictionaryContentFormat,
    sessionVariableFormat,
    wordDescriptionFormat
}