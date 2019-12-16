import { Component, OnInit } from '@angular/core';
import { StateMachineService } from 'src/app/global/services';

@Component({
  selector: 'ami-fullstack-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

  round: string;
  roles: Role[] = [
    { name: 'Mafioso', description: 'A Mafioso is a member of the Mafia who has no special abilities.' },
    { name: 'Godfather', description: 'A Godfather is a member of the Mafia who will be identified as an innocent by the detectives.' },
    { name: 'Barman', description: `A Barman is a member of the Mafia who may anonymously cancel the effect of another role's ability every night.` },
    { name: 'Detective', description: `A Detective is an innocent who has the abilty to learn one player’s alignment every night.` },
    { name: 'Doctor', description: 'A Doctor is an innocent who has the ability to save one player every night.' },
    { name: 'Mason', description: 'Masons are town-aligned players who can recognize each other.' },
    { name: 'Civilian', description: 'A Civilian is an innocent who has no extraordinary abilities.' }
  ];

  constructor(
    private stateMachine: StateMachineService
  ) { }

  async ngOnInit() {
    // this.round = <string> await this.stateMachine.getRound().toPromise();
    this.round = "e";
    console.log(this.round);
  }

}

interface Role {
  name: string;
  description: string;
}