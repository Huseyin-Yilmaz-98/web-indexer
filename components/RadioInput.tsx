import React from 'react';
import styled from "styled-components";

type Props = {
    name: string;
    value: string;
    label: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>, tableId: string) => void;
    defaultChacked?: boolean;
    tableId: string;
}

const RadioInput = ({ name, value, label, onInputChange, defaultChacked, tableId = ""}: Props) => {
    return (
        <Container>
            <Radio type="radio" name={`${name}_${tableId}`} value={`${value}_${tableId}`} id={`${value}_${tableId}`} onChange={(e) => onInputChange(e, tableId)} defaultChecked={defaultChacked} />
            <Label htmlFor={value}>{label}</Label>
        </Container>
    )
}

const Container = styled.div`
`;

const Radio = styled.input`
    
`;

const Label = styled.label`
    margin-left: 0.5em;
    color: white;
`;

export default RadioInput;