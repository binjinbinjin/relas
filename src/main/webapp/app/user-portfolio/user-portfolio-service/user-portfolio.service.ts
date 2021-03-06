import { Injectable } from '@angular/core';
import { SERVER_API_URL } from '../../app.constants';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { creatRequestOptionWithoutPaging, createRequestOption } from '../../shared';
import { Principal } from '../../shared/auth/principal.service';
import { UserPortfolio } from '../user-portfolio.model';

export type UserPortfolioServiceConnection = HttpResponse<UserPortfolio>;
@Injectable()
export class UserPortfolioService {

    private resourceUrl = SERVER_API_URL + 'api/user-portfolios';
    private resourceSearchUrl = SERVER_API_URL + 'api/_search/user-portfolios';
    constructor(private http: HttpClient, private principal: Principal ) { }

    /**Update user Porfolio */
    updatePortfolio(portfolio: UserPortfolio): Observable<UserPortfolioServiceConnection>  {
        return this.http.put<UserPortfolio>(this.resourceUrl, portfolio, {observe: 'response'});
    }

    /**Fetch the portfolio of current user */
    fetchPortfolio(): Observable<UserPortfolioServiceConnection> | null {
        const userLogin = this.principal.getUserLogin();
        return this.fetchPortfolioByLogin(userLogin);
    }

    /**Fetch portfolio by user login */
    fetchPortfolioByLogin(userLogin: String): Observable<UserPortfolioServiceConnection> | null {
        if (!userLogin)
            return null;
        const option = creatRequestOptionWithoutPaging({ login: userLogin });
        return this.http.get<UserPortfolio>(this.resourceSearchUrl + '/login', { params: option, observe: 'response' });
    }

    /**Fetch the portfolios by gender */
    getPortfolioByGender(req): Observable<HttpResponse<UserPortfolio[]>> {
        if (!req)
            throw Error('cant be null');
        const option = createRequestOption(req);

        return this.http.get<UserPortfolio[]>(this.resourceSearchUrl + '/gender', {params: option, observe: 'response'});
    }

}
