import { useEffect, useRef, useState } from 'react';

const DEFAULT_PAGE_SIZE = 10;
const INITIAL_PAGE_INDEX = 1;

export const useTransfersPagination = (
  totalItems: number,
  type: string | null,
) => {
  const pageIndexRef = useRef(INITIAL_PAGE_INDEX);

  const [currentItems, setCurrentItems] = useState({
    first: 0,
    last: DEFAULT_PAGE_SIZE,
  });
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const getLastPageIndex = () => Math.ceil(totalItems / pageSize) - 1;

  const updateCurrentPage = (index: number) => {
    pageIndexRef.current = index;
    const lastPage = getLastPageIndex();
    const first =
      index === INITIAL_PAGE_INDEX ? INITIAL_PAGE_INDEX : index * pageSize + 1;

    if (lastPage > 1) {
      const last = index === lastPage ? totalItems : first - 1 + pageSize;
      setCurrentItems({ first, last });
    } else {
      setCurrentItems({ first, last: totalItems });
    }
  };

  const onPrevPageClick = () => {
    if (pageIndexRef.current === 1) {
      return;
    }
    updateCurrentPage(pageIndexRef.current - 1);
  };

  const onNextPageClick = () => {
    if (pageIndexRef.current === getLastPageIndex()) {
      return;
    }
    updateCurrentPage(pageIndexRef.current + 1);
  };

  useEffect(() => {
    if (!type || !totalItems) {
      return;
    }
    if (pageIndexRef.current) {
      updateCurrentPage(INITIAL_PAGE_INDEX);
    }
  }, [type, totalItems]);

  useEffect(() => {
    // to re-render pagination
    updateCurrentPage(pageIndexRef.current);
  }, [pageSize]);

  return {
    totalItems,
    currentItems,
    isPrevDisabled: pageIndexRef.current === INITIAL_PAGE_INDEX,
    isNextDisabled: pageIndexRef.current === getLastPageIndex(),
    pageSize,
    setPageSize,
    onFirstPageClick: () => updateCurrentPage(INITIAL_PAGE_INDEX),
    onLastPageClick: () => updateCurrentPage(getLastPageIndex()),
    onPrevPageClick,
    onNextPageClick,
  };
};
