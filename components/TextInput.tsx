import React from 'react';
import styled from "styled-components";

type Props = {
    id: string;
    label: string;
    setText?: React.Dispatch<React.SetStateAction<string>>;
    inputType?: string;
    defaultValue?: string;
    setRootUrl?: (url: string) => void;
}

const TextInput = ({ id, label, setText, inputType = "text", defaultValue, setRootUrl }: Props) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (setText)
            setText(e.target.value);
        else if (setRootUrl)
            setRootUrl(e.target.value);
    }

    return (
        <React.Fragment>
            <Label htmlFor={id}>{label}</Label>
            <Input type={inputType} onChange={onChange} id={id} name={id} defaultValue={defaultValue || ""} />
        </React.Fragment>
    )
}

const Input = styled.input`
    margin-bottom: 2em;
    width:60%;
    font-size:1.10em;
`;

const Label = styled.label`
    margin-top: 2em;
    margin-bottom: 1em;
    color: white;
`;

export default TextInput;