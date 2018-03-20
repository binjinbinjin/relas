import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { TweetMySuffix } from './tweet-my-suffix.model';
import { TweetMySuffixPopupService } from './tweet-my-suffix-popup.service';
import { TweetMySuffixService } from './tweet-my-suffix.service';

@Component({
    selector: 'jhi-tweet-my-suffix-delete-dialog',
    templateUrl: './tweet-my-suffix-delete-dialog.component.html'
})
export class TweetMySuffixDeleteDialogComponent {

    tweet: TweetMySuffix;

    constructor(
        private tweetService: TweetMySuffixService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.tweetService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'tweetListModification',
                content: 'Deleted an tweet'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-tweet-my-suffix-delete-popup',
    template: ''
})
export class TweetMySuffixDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private tweetPopupService: TweetMySuffixPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.tweetPopupService
                .open(TweetMySuffixDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
