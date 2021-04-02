import React from 'react';
import styled from "styled-components";

type Props = {
    children: React.ReactNode;
    onSubmit: () => void;
    formTitle: string;
    warning: string;
}

const Form = ({ children, onSubmit, formTitle, warning }: Props) => {
    return (
        <StyledForm>
            <FormHeader>{formTitle}</FormHeader>
            {children}
            <SubmitButton type="submit" onClick={(e) => {
                e.preventDefault();
                onSubmit();
            }}></SubmitButton>
            {warning && <Warning>{warning}</Warning>}
        </StyledForm>
    )
}

const StyledForm = styled.form`
    margin-top: 3em;
    margin-bottom: 10em;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 600px;
    border: 2px solid white;
    border-radius: 12px;
`;

const SubmitButton = styled.input`
    margin-top: 15px;
    margin-bottom: 10px;
`;

const FormHeader = styled.h2`
    color: white;
`;

const Warning = styled.p`
    margin: 2em 0px 2em 0px;
    color: red;
    font-size: 1.5rem;
    font-weight: bold;
`;

export default Form;