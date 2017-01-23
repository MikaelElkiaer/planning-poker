import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

import { AppModule } from './app.module';
import { environment } from './config/environment';

if (environment.production)
    enableProdMode();

const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule);