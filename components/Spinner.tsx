import styled from "styled-components";

const Spinner = () => {
    return (
        <SpinnerContainer>
            <StyledSpinner />
        </SpinnerContainer>
    )
}

const SpinnerContainer = styled.div`
    top:0px;
    position: fixed;
    width: 100%;
    height:100%;
    z-index: 50;
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;
`;

const StyledSpinner = styled.div`
    border: 16px solid white;
    border-top: 16px solid #3498db;
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
    margin:auto;
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export default Spinner;