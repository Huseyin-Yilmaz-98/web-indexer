import React, { useState } from 'react';
import styled from "styled-components";
import { FirstPageData, TreePageData, TreePageDatasObject } from '../interfaces';
import MultiFrequenciesTable from './MultiFrequenciesTable';
type Props = {
    firstPageData: FirstPageData;
    treePageDatasObjects: TreePageDatasObject[];
    children?: React.ReactNode;
    firstPageUrl: string;
    synonymCheck: boolean;
}

const TreeView = ({ children, firstPageData, treePageDatasObjects, firstPageUrl, synonymCheck }: Props) => {
    const getBranches = (element: TreePageData, elements: TreePageData[]) => {
        //recursive function that returns the sub links data of a paga data
        return (
            <React.Fragment key={element.url}>
                {
                    element.success
                        ?
                        <React.Fragment>
                            <p onClick={() => setModalPageData(element)}>{`${"\u00A0".repeat(element.depth * 7)}\u2022 (Similarity: ${element.similarity.toFixed(2)}%) ${element.url}`}</p>
                            {elements.filter(el => el.referrer === element.url).map(el => getBranches(el, elements))}
                            {element.depth < 3 && <p>{"\u00A0"}</p>}

                        </React.Fragment>
                        :
                        <React.Fragment>
                            <p className="no-click">{`${"\u00A0".repeat(element.depth * 7)}\u2022 (Failed) ${element.url}`}</p>
                            <p className="no-click">{`${"\u00A0".repeat((element.depth + 1) * 7)}\u2022 Reason: ${element.error}`}</p>
                        </React.Fragment>
                }
            </React.Fragment>
        )
    }

    const [detailedUrls, setdetailedUrls] = useState<string[]>([]);
    const [modalPageData, setModalPageData] = useState<TreePageData>();

    const toggle = (url: string) => {
        //expand or shrink a root url data
        const newDetailedUrls = [...detailedUrls];
        if (!newDetailedUrls.includes(url)) {
            newDetailedUrls.push(url);
            setdetailedUrls(newDetailedUrls);
        }
        else {
            setdetailedUrls(newDetailedUrls.filter(el => el !== url));
        }
    };

    return (
        <React.Fragment>
            {
                modalPageData && modalPageData.success &&
                <Modal className="modal" onClick={(event) => (event.target as any).className.includes("modal") && setModalPageData(undefined)}>
                    <ModelContainer>
                        <OuterContainer>
                            <h1>Similarity: {modalPageData.similarity.toFixed(2)}%</h1>
                            <TablesContainer>
                                <MultiFrequenciesTable tableId="1" keywords={firstPageData.keywords} frequencies={firstPageData.frequencies} simplifiedFrequencies={firstPageData.simplifiedFrequencies} synonymCheck={synonymCheck}>
                                    <p>Url: <a href={firstPageUrl} target="_blank">{firstPageUrl}</a></p>
                                    <p>Title: {firstPageData.pageTitle.split(/-|\|/)[0]}</p>
                                    <p>First Page Keywords Percentage: {firstPageData.percentage.toFixed(2)}%</p>
                                </MultiFrequenciesTable>
                                <MultiFrequenciesTable tableId="2" keywords={modalPageData.keywords} frequencies={modalPageData.frequencies} simplifiedFrequencies={modalPageData.simplifiedFrequencies} synonymCheck={synonymCheck}>
                                    <p>Url: <a href={modalPageData.url} target="_blank">{modalPageData.url}</a></p>
                                    <p>Title: {modalPageData.pageTitle.split(/-|\|/)[0]}</p>
                                    <p>First Page Keywords Percentage: {modalPageData.percentage.toFixed(2)}%</p>
                                </MultiFrequenciesTable>
                            </TablesContainer>
                        </OuterContainer>
                    </ModelContainer>
                </Modal>
            }

            {children}
            <Tree>
                {
                    treePageDatasObjects.map((el, i) => {
                        return (
                            <TreeBranch key={i}>
                                <h2 onClick={() => toggle(el.rootUrl)}>{`+ (Overall Similarity: ${el.overallSimilarity.toFixed(2)}%) ${el.rootUrl}`}</h2>
                                {
                                    detailedUrls.includes(el.rootUrl)
                                    && <React.Fragment>
                                        {
                                            (() => {
                                                const firstDepthElement = el.treePageDatas.find(treePageData => treePageData.depth === 1);
                                                return firstDepthElement &&
                                                    <React.Fragment>{getBranches(firstDepthElement, el.treePageDatas)}</React.Fragment>
                                            })()
                                        }
                                    </React.Fragment>
                                }
                            </TreeBranch>
                        )
                    })
                }
            </Tree>
        </React.Fragment>
    )
}

const Tree = styled.div`
    color: white;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    width: 1200px;
    h2{
        width: 1200px;
        color: #f0dfdf;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

const TreeBranch = styled.div`
    text-align: start;
    p{
        padding: 0px;
        margin:5px 0px 0px 1em;
        width: 1200px;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        
    }
    .no-click{
        cursor: unset;
    }
`;

const Modal = styled.div`
    position: fixed;
    z-index: 100;
    padding-top: 2em;
    padding-right:10px;
    padding-left:10px;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0,0,0);
    background-color: rgba(0,0,0,0.4);
`;

const ModelContainer = styled.div`
    position: relative;
    background-color: #2b2e4a;
    margin: auto;
    padding: 1em 0px 5em 0px;
    border: 1px solid #888;
    width: 90%;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
    -webkit-animation-name: animatetop;
    -webkit-animation-duration: 0.4s;
    animation-name: animatetop;
    animation-duration: 0.4s;
    @-webkit-keyframes animatetop {
    from {top:-300px; opacity:0} 
    to {top:0; opacity:1}
    }
    
    @keyframes animatetop {
        from {top:-300px; opacity:0}
        to {top:0; opacity:1}
    }
`;

const OuterContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    h1{
        color: #d8a8a8;
        margin-bottom: 1em;
    }
`;

const TablesContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
`;

export default TreeView;