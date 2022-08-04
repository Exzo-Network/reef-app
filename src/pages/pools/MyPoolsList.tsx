import { faArrowUpFromBracket, faCoins } from '@fortawesome/free-solid-svg-icons';
import { appState, hooks } from '@reef-defi/react-lib';
import Uik from '@reef-defi/ui-kit';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import TokenPricesContext from '../../context/TokenPricesContext';
import { POOL_CHART_URL } from '../../urls';
import './pools.css';
import PoolsSearch from './PoolsSearch';

interface Pool {
  address?: string,
  tvl: string;
  volume24h: string;
  volumeChange24h: number;
  myLiquidity?: string;
  token1: {
    name: string;
    image: string;
  };
  token2: {
    name: string;
    image: string;
  };
}

const MyPoolsList = (): JSX.Element => {
  const perPage = 10;
  const [currentPage, changePage] = useState(1);
  const [changedPage, setChangedPage] = useState(false);
  const [search, setSearch] = useState('');
  const tokenPrices = useContext(TokenPricesContext);

  const signer = hooks.useObservableState(
    appState.selectedSigner$,
  );
  const network = hooks.useObservableState(appState.currentNetwork$);

  const [pools,, count] = hooks.usePoolsList({
    limit: perPage,
    offset: (currentPage - 1) * perPage,
    reefscanApi: network?.reefscanUrl || '',
    search,
    signer: signer?.address || '',
    tokenPrices,
    queryType: 'User',
  });

  const history = useHistory();
  const openPool = (
    address: string,
    action: 'trade' | 'provide' | 'withdraw' = 'trade',
  ): void => history.push(
    POOL_CHART_URL
      .replace(':address', address || 'address')
      .replace(':action', action),
  );

  if (
    !pools.length
    && !search
    && !changedPage
  ) return (<></>);

  return (
    <div className="pools__list">
      <div className="pools__table-top">
        <Uik.Text type="title">My Pools</Uik.Text>
        <PoolsSearch
          value={search}
          onInput={(value) => { setSearch(value); }}
        />
      </div>

      <Uik.Table
        seamless
        pagination={{
          count: Math.ceil(count / perPage), // TODO change to count once endpoints are online...
          current: currentPage,
          onChange: (page) => { changePage(page); setChangedPage(true); },
        }}
      >
        <Uik.THead>
          <Uik.Tr>
            <Uik.Th>Pair</Uik.Th>
            <Uik.Th align="right">My Liquidity</Uik.Th>
            <Uik.Th align="right">TVL</Uik.Th>
            <Uik.Th align="right">24h Vol.</Uik.Th>
            <Uik.Th align="right">24h Vol. %</Uik.Th>
            <Uik.Th />
          </Uik.Tr>
        </Uik.THead>

        <Uik.TBody>
          {
              pools.map((item: Pool) => (
                <Uik.Tr
                  key={`my-pool-${item.address}`}
                  onClick={() => openPool(item.address || '')}
                >
                  <Uik.Td>
                    <div className="pools__pair">
                      <img src={item.token1.image} alt={item.token1.name} />
                      <img src={item.token2.image} alt={item.token1.name} />
                    </div>
                    <span>
                      { item.token1.name }
                      {' '}
                      -
                      {' '}
                      { item.token2.name }
                    </span>
                  </Uik.Td>
                  <Uik.Td align="right">
                    $
                    {' '}
                    { Uik.utils.formatHumanAmount(item.myLiquidity || '') }
                  </Uik.Td>
                  <Uik.Td align="right">
                    $
                    {' '}
                    { Uik.utils.formatHumanAmount(item.tvl || '') }
                  </Uik.Td>
                  <Uik.Td align="right">
                    $
                    {' '}
                    { Uik.utils.formatHumanAmount(item.volume24h || '') }
                  </Uik.Td>
                  <Uik.Td align="right">
                    <Uik.Trend
                      type={item.volumeChange24h >= 0 ? 'good' : 'bad'}
                      direction={item.volumeChange24h >= 0 ? 'up' : 'down'}
                      text={`${item.volumeChange24h.toFixed(2)}%`}
                    />
                  </Uik.Td>
                  <Uik.Td align="right">
                    <Uik.Button
                      text="Withdraw"
                      icon={faArrowUpFromBracket}
                      fill
                      onClick={(e) => {
                        e.stopPropagation();
                        openPool(item.address || '', 'withdraw');
                      }}
                    />
                    <Uik.Button
                      text="Provide"
                      icon={faCoins}
                      fill
                      onClick={(e) => {
                        e.stopPropagation();
                        openPool(item.address || '', 'provide');
                      }}
                    />
                  </Uik.Td>
                </Uik.Tr>
              ))
            }
        </Uik.TBody>
      </Uik.Table>
    </div>
  );
};

export default MyPoolsList;
