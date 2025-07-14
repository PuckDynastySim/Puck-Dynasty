-- Add foreign key constraints for the new historical tables
ALTER TABLE public.season_champions
ADD CONSTRAINT season_champions_league_id_fkey
FOREIGN KEY (league_id) REFERENCES public.leagues(id);

ALTER TABLE public.season_champions
ADD CONSTRAINT season_champions_champion_team_id_fkey
FOREIGN KEY (champion_team_id) REFERENCES public.teams(id);

ALTER TABLE public.season_champions
ADD CONSTRAINT season_champions_runner_up_team_id_fkey
FOREIGN KEY (runner_up_team_id) REFERENCES public.teams(id);

ALTER TABLE public.player_awards
ADD CONSTRAINT player_awards_league_id_fkey
FOREIGN KEY (league_id) REFERENCES public.leagues(id);

ALTER TABLE public.player_awards
ADD CONSTRAINT player_awards_player_id_fkey
FOREIGN KEY (player_id) REFERENCES public.players(id);

ALTER TABLE public.player_awards
ADD CONSTRAINT player_awards_team_id_fkey
FOREIGN KEY (team_id) REFERENCES public.teams(id);

ALTER TABLE public.draft_history
ADD CONSTRAINT draft_history_league_id_fkey
FOREIGN KEY (league_id) REFERENCES public.leagues(id);

ALTER TABLE public.draft_history
ADD CONSTRAINT draft_history_team_id_fkey
FOREIGN KEY (team_id) REFERENCES public.teams(id);

ALTER TABLE public.draft_history
ADD CONSTRAINT draft_history_player_id_fkey
FOREIGN KEY (player_id) REFERENCES public.players(id);

ALTER TABLE public.season_archives
ADD CONSTRAINT season_archives_league_id_fkey
FOREIGN KEY (league_id) REFERENCES public.leagues(id);

ALTER TABLE public.season_archives
ADD CONSTRAINT season_archives_champion_team_id_fkey
FOREIGN KEY (champion_team_id) REFERENCES public.teams(id);

ALTER TABLE public.career_milestones
ADD CONSTRAINT career_milestones_player_id_fkey
FOREIGN KEY (player_id) REFERENCES public.players(id);

ALTER TABLE public.career_milestones
ADD CONSTRAINT career_milestones_game_id_fkey
FOREIGN KEY (game_id) REFERENCES public.games(id);