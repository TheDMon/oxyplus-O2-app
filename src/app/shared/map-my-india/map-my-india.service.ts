import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MapMyIndiaService {
  private grantType: string = 'client_credentials';
  private clientId: string =
    '33OkryzDZsKoJLD_fYSwdjLlw7tIXIk7xw_1Zte7XnVG19zOXmr9Kv4EGgAshlGAPcj59e3T-uuS1RhbmrehLAUy1MnnQSSM';
  private clientSecret: string =
    'lrFxI-iSEg9gueb0cTXgvDaayMKJN4r0M9WCPcBS4DmmJaHg-uUfTdcfpkOTovInCpHwOkyC87lRi6LKWvjNgnSzp1gfJ6DCnHYCeqTrvxY=';
  private securityURL: string =
    'https://outpost.mapmyindia.com/api/security/v3.0.5/oauth/token?grant_type=' +
    this.grantType +
    '&client_id=' +
    this.clientId +
    '&client_secret=' +
    this.clientSecret;
  private autoSuggestURL: string =
    'https://atlas.mapmyindia.com/api/places/search/json?query=agra&location=28.5454,77.455454&bridge&explain&username=balmukand';
  private nearbyURL: string =
    'https://atlas.mapmyindia.com/api/places/nearby/json?explain&richData&username=balmukand&refLocation=28.467470,77.077518&keywords=FINATM';

  constructor(private http: HttpClient) {}

  getToken() {
    return this.http.post(this.securityURL, null);
  }

  autoSuggest(token: string) {
    return this.getToken().pipe(
      take(1),
      switchMap((res) => {
        token = res['access_token'];
        const _url = this.autoSuggestURL + '&access_token=' + token;
        return this.http.get(_url);
      })
    );
  }
}
