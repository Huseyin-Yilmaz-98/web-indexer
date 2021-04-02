import React, { useState } from "react";
import styled from "styled-components";
import { IFrequency } from "../interfaces";
import FrequenciesTable from "./FrequenciesTable";
import RadioInput from "./RadioInput";

type Props = {
    keywords: IFrequency[];
    frequencies: IFrequency[];
    simplifiedFrequencies: IFrequency[];
    tableId?: string;
    children?: React.ReactNode;
    synonymCheck?: boolean;
}

const MultiFrequenciesTable = ({ keywords, frequencies, simplifiedFrequencies, tableId = "", children, synonymCheck = false }: Props) => {
    const [resultToShow, setResultToShow] = useState(keywords);
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, tableId: string) => {
        switch (e.target.value) {
            case `keywords_${tableId}`:
                setResultToShow(keywords);
                break;
            case `frequencies_${tableId}`:
                setResultToShow(frequencies);
                break;
            case `simplifiedFrequencies_${tableId}`:
                setResultToShow(simplifiedFrequencies);
                break;
        }
    };

    return (
        <MultiFrequenciesTableContainer>
            <FrequenciesTable frequencyData={resultToShow} synonymCheck = {synonymCheck}>
                {children}
                <SelectionContainer>
                    <RadioInput name="dataType" value="keywords" label="Keywords" onInputChange={onInputChange} defaultChacked={true} tableId={tableId} />
                    <RadioInput name="dataType" value="frequencies" label="Frequencies" onInputChange={onInputChange} tableId={tableId} />
                    <RadioInput name="dataType" value="simplifiedFrequencies" label="Simplified Frequencies" onInputChange={onInputChange} tableId={tableId} />
                </SelectionContainer>
            </FrequenciesTable>
        </MultiFrequenciesTableContainer>
    )
}

const MultiFrequenciesTableContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin: 0px 50px 0px 50px;
`;

const SelectionContainer = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: row;
    width: 500px;
    margin: 2em 0px 3em 0px;
`;

export default MultiFrequenciesTable;