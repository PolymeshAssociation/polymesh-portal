import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_PAGE_SIZE = 10;
const INITIAL_PAGE_INDEX = 1;

export const useTransfersPagination = (
  totalItems: number,
  type: string | null,
) => {
  const pageIndexRef = useRef(INITIAL_PAGE_INDEX);

  const [currentItems, setCurrentItems] = useState({
    first: 1,
    last: DEFAULT_PAGE_SIZE,
  });
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const getLastPageIndex = useCallback(
    () => Math.ceil(totalItems / pageSize),
    [pageSize, totalItems],
  );

  const updateCurrentPage = useCallback(
    (index: number) => {
      pageIndexRef.current = index;
      const lastPage = getLastPageIndex();
      const first = (index - 1) * pageSize + 1;
      const last = index === lastPage ? totalItems : index * pageSize;
      setCurrentItems({ first, last });
    },
    [getLastPageIndex, pageSize, totalItems],
  );

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
    updateCurrentPage(INITIAL_PAGE_INDEX);
  }, [type, totalItems, updateCurrentPage]);

  useEffect(() => {
    // to re-render pagination
    updateCurrentPage(pageIndexRef.current);
  }, [pageSize, updateCurrentPage]);

  return {
    totalItems,
    currentItems,
    isPrevDisabled: pageIndexRef.current === INITIAL_PAGE_INDEX,
    isNextDisabled: currentItems.last === totalItems,
    pageSize,
    setPageSize,
    onFirstPageClick: () => updateCurrentPage(INITIAL_PAGE_INDEX),
    onLastPageClick: () => updateCurrentPage(getLastPageIndex()),
    onPrevPageClick,
    onNextPageClick,
  };
};
