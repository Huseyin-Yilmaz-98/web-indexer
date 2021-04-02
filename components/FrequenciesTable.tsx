import React from "react";
import styled from "styled-components";
import { IFrequency } from "../interfaces";
import synonyms from "synonyms/src.json";

type Props = {
    frequencyData: IFrequency[];
    children?: React.ReactNode;
    synonymCheck?: boolean;
}

const FrequenciesTable = ({ frequencyData, children, synonymCheck = false }: Props) => {
    return (
        <TableContainer>
            <TableTitle>
                {children}
            </TableTitle>
            <Table>
                <thead>
                    <tr>
                        <td>Word</td>
                        <td>Frequency</td>
                    </tr>
                </thead>
                <tbody>
                    {frequencyData.map((el, i) => {
                        return (
                            <tr key={i}>
                                <td>{synonymCheck ? getSynonymsString(el.word) : el.word}</td>
                                <td>{el.frequency}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>

        </TableContainer>
    )
}

const TableContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    flex-direction: column;
`;

const Table = styled.table`
    border-collapse: collapse;
    table-layout: fixed;
    caption-side: top;
    width: 500px;

    thead{
        color: yellow;
    }

    tr{
        border-collapse: collapse;
    }

    td{
        border: 1px solid white;
        padding: 5px 1em 5px 1em;
        border-collapse: collapse;
        text-align: center;
    }
    
`;

const TableTitle = styled.div`
    display: flex;
    align-items: center;
    width: 600px;
    flex-direction: column;
    p{
        text-align: center;
        width: 400px;
        color: white;
        font-weight: bold;
        font-size: 1.1em;
        width: 400px;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    a, a:visited, a:active{
        color: white;
    }
`;

const getSynonyms = (word: string) => {
    let result: string[] = [];
    const wordData = (synonyms as any)[word];
    if (wordData) {
        for (let array in wordData) {
            result = result.concat(wordData[array].filter((el: string) => el.length > 1));
        }
    }
    return result;
}

/*stringifies a synonyms list*/
const getSynonymsString = (word: string) => {
    const synonyms = [word].concat(getSynonyms(word));
    return [...new Set(synonyms)].join(", ");
}

export default FrequenciesTable;