export interface IFrequency {
  word: string;
  frequency: number;
}

type TreePageDataRoot = {
  referrer: string;
  url: string;
  depth: number;
}

interface FailedTreePageData extends TreePageDataRoot {
  success: false;
  error: string;
}

interface SuccessfulTreePageData extends TreePageDataRoot {
  success: true;
  frequencies: IFrequency[];
  keywords: IFrequency[];
  simplifiedFrequencies: IFrequency[];
  similarity: number;
  percentage: number;
  pageTitle: string;
  simplifiedCount: number;
}

export type TreePageData = SuccessfulTreePageData | FailedTreePageData;

export interface TreePageDatasObject {
  rootUrl: string;
  overallSimilarity: number;
  treePageDatas: TreePageData[];
}

export type TreeParserResponse =
  | {
    success: false;
    error: string;
  } | {
    success: true;
    firstPageData: FirstPageData;
    treePageDatasObjects: TreePageDatasObject[];
  }

export type FrequenciesResponse =
  | {
    success: true;
    data: IFrequency[]
  } | {
    success: false;
    error: string;
  }

export type KeywordsResponse =
  | {
    success: true;
    keywords: IFrequency[];
    frequencies: IFrequency[];
    simplifiedFrequencies: IFrequency[];
    pageTitle: string;
  } | {
    success: false;
    error: string;
  }

export type SimilarityResponse =
  | {
    success: true;
    firstPageData: FirstPageData,
    secondPageData: SecondPageData
  } | {
    success: false;
    error: string;
  }

export enum PageType {
  FIRST_PAGE,
  SECOND_PAGE
}

interface PageDataRoot {
  keywords: IFrequency[];
  frequencies: IFrequency[];
  simplifiedFrequencies: IFrequency[];
  pageTitle: string;
  simplifiedCount: number;
  percentage: number;
}

export interface FirstPageData extends PageDataRoot {
  pageType: PageType.FIRST_PAGE;
}

export interface SecondPageData extends PageDataRoot {
  pageType: PageType.SECOND_PAGE;
  similarity: number;
}


