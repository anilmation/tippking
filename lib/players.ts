export type Player = {
  name: string
  country: string
  countryCode: string
  flag: string
}

export const WM2026_PLAYERS: Player[] = [
  // Argentinien
  { name: 'Lionel Messi', country: 'Argentinien', countryCode: 'ARG', flag: 'ar' },
  { name: 'Julián Álvarez', country: 'Argentinien', countryCode: 'ARG', flag: 'ar' },
  { name: 'Lautaro Martínez', country: 'Argentinien', countryCode: 'ARG', flag: 'ar' },
  { name: 'Ángel Di María', country: 'Argentinien', countryCode: 'ARG', flag: 'ar' },
  { name: 'Paulo Dybala', country: 'Argentinien', countryCode: 'ARG', flag: 'ar' },
  // Frankreich
  { name: 'Kylian Mbappé', country: 'Frankreich', countryCode: 'FRA', flag: 'fr' },
  { name: 'Antoine Griezmann', country: 'Frankreich', countryCode: 'FRA', flag: 'fr' },
  { name: 'Ousmane Dembélé', country: 'Frankreich', countryCode: 'FRA', flag: 'fr' },
  { name: 'Marcus Thuram', country: 'Frankreich', countryCode: 'FRA', flag: 'fr' },
  { name: 'Randal Kolo Muani', country: 'Frankreich', countryCode: 'FRA', flag: 'fr' },
  { name: 'Olivier Giroud', country: 'Frankreich', countryCode: 'FRA', flag: 'fr' },
  // Brasilien
  { name: 'Vinícius Jr.', country: 'Brasilien', countryCode: 'BRA', flag: 'br' },
  { name: 'Rodrygo', country: 'Brasilien', countryCode: 'BRA', flag: 'br' },
  { name: 'Raphinha', country: 'Brasilien', countryCode: 'BRA', flag: 'br' },
  { name: 'Endrick', country: 'Brasilien', countryCode: 'BRA', flag: 'br' },
  { name: 'Gabriel Martinelli', country: 'Brasilien', countryCode: 'BRA', flag: 'br' },
  { name: 'Richarlison', country: 'Brasilien', countryCode: 'BRA', flag: 'br' },
  { name: 'Neymar', country: 'Brasilien', countryCode: 'BRA', flag: 'br' },
  // England
  { name: 'Harry Kane', country: 'England', countryCode: 'ENG', flag: 'gb-eng' },
  { name: 'Jude Bellingham', country: 'England', countryCode: 'ENG', flag: 'gb-eng' },
  { name: 'Phil Foden', country: 'England', countryCode: 'ENG', flag: 'gb-eng' },
  { name: 'Bukayo Saka', country: 'England', countryCode: 'ENG', flag: 'gb-eng' },
  { name: 'Marcus Rashford', country: 'England', countryCode: 'ENG', flag: 'gb-eng' },
  { name: 'Cole Palmer', country: 'England', countryCode: 'ENG', flag: 'gb-eng' },
  // Deutschland
  { name: 'Florian Wirtz', country: 'Deutschland', countryCode: 'GER', flag: 'de' },
  { name: 'Jamal Musiala', country: 'Deutschland', countryCode: 'GER', flag: 'de' },
  { name: 'Kai Havertz', country: 'Deutschland', countryCode: 'GER', flag: 'de' },
  { name: 'Leroy Sané', country: 'Deutschland', countryCode: 'GER', flag: 'de' },
  { name: 'Thomas Müller', country: 'Deutschland', countryCode: 'GER', flag: 'de' },
  { name: 'Serge Gnabry', country: 'Deutschland', countryCode: 'GER', flag: 'de' },
  { name: 'Niclas Füllkrug', country: 'Deutschland', countryCode: 'GER', flag: 'de' },
  // Spanien
  { name: 'Lamine Yamal', country: 'Spanien', countryCode: 'ESP', flag: 'es' },
  { name: 'Álvaro Morata', country: 'Spanien', countryCode: 'ESP', flag: 'es' },
  { name: 'Nico Williams', country: 'Spanien', countryCode: 'ESP', flag: 'es' },
  { name: 'Pedri', country: 'Spanien', countryCode: 'ESP', flag: 'es' },
  { name: 'Dani Olmo', country: 'Spanien', countryCode: 'ESP', flag: 'es' },
  { name: 'Ferran Torres', country: 'Spanien', countryCode: 'ESP', flag: 'es' },
  // Portugal
  { name: 'Cristiano Ronaldo', country: 'Portugal', countryCode: 'POR', flag: 'pt' },
  { name: 'Bruno Fernandes', country: 'Portugal', countryCode: 'POR', flag: 'pt' },
  { name: 'Rafael Leão', country: 'Portugal', countryCode: 'POR', flag: 'pt' },
  { name: 'Bernardo Silva', country: 'Portugal', countryCode: 'POR', flag: 'pt' },
  { name: 'João Félix', country: 'Portugal', countryCode: 'POR', flag: 'pt' },
  { name: 'Gonçalo Ramos', country: 'Portugal', countryCode: 'POR', flag: 'pt' },
  // Niederlande
  { name: 'Erling Haaland', country: 'Norwegen', countryCode: 'NOR', flag: 'no' },
  { name: 'Memphis Depay', country: 'Niederlande', countryCode: 'NED', flag: 'nl' },
  { name: 'Cody Gakpo', country: 'Niederlande', countryCode: 'NED', flag: 'nl' },
  { name: 'Xavi Simons', country: 'Niederlande', countryCode: 'NED', flag: 'nl' },
  { name: 'Brian Brobbey', country: 'Niederlande', countryCode: 'NED', flag: 'nl' },
  { name: 'Donyell Malen', country: 'Niederlande', countryCode: 'NED', flag: 'nl' },
  // Belgien
  { name: 'Romelu Lukaku', country: 'Belgien', countryCode: 'BEL', flag: 'be' },
  { name: 'Kevin De Bruyne', country: 'Belgien', countryCode: 'BEL', flag: 'be' },
  { name: 'Lois Openda', country: 'Belgien', countryCode: 'BEL', flag: 'be' },
  { name: 'Jeremy Doku', country: 'Belgien', countryCode: 'BEL', flag: 'be' },
  { name: 'Dodi Lukebakio', country: 'Belgien', countryCode: 'BEL', flag: 'be' },
  // USA
  { name: 'Christian Pulisic', country: 'USA', countryCode: 'USA', flag: 'us' },
  { name: 'Gio Reyna', country: 'USA', countryCode: 'USA', flag: 'us' },
  { name: 'Ricardo Pepi', country: 'USA', countryCode: 'USA', flag: 'us' },
  { name: 'Folarin Balogun', country: 'USA', countryCode: 'USA', flag: 'us' },
  { name: 'Tim Weah', country: 'USA', countryCode: 'USA', flag: 'us' },
  // Mexiko
  { name: 'Hirving Lozano', country: 'Mexiko', countryCode: 'MEX', flag: 'mx' },
  { name: 'Raúl Jiménez', country: 'Mexiko', countryCode: 'MEX', flag: 'mx' },
  { name: 'Santiago Giménez', country: 'Mexiko', countryCode: 'MEX', flag: 'mx' },
  { name: 'Henry Martín', country: 'Mexiko', countryCode: 'MEX', flag: 'mx' },
  // Uruguay
  { name: 'Darwin Núñez', country: 'Uruguay', countryCode: 'URU', flag: 'uy' },
  { name: 'Rodrigo Bentancur', country: 'Uruguay', countryCode: 'URU', flag: 'uy' },
  { name: 'Federico Valverde', country: 'Uruguay', countryCode: 'URU', flag: 'uy' },
  { name: 'Luis Suárez', country: 'Uruguay', countryCode: 'URU', flag: 'uy' },
  // Kolumbien
  { name: 'Luis Díaz', country: 'Kolumbien', countryCode: 'COL', flag: 'co' },
  { name: 'Jhon Durán', country: 'Kolumbien', countryCode: 'COL', flag: 'co' },
  { name: 'Radamel Falcao', country: 'Kolumbien', countryCode: 'COL', flag: 'co' },
  { name: 'James Rodríguez', country: 'Kolumbien', countryCode: 'COL', flag: 'co' },
  // Marokko
  { name: 'Achraf Hakimi', country: 'Marokko', countryCode: 'MAR', flag: 'ma' },
  { name: 'Hakim Ziyech', country: 'Marokko', countryCode: 'MAR', flag: 'ma' },
  { name: 'Youssef En-Nesyri', country: 'Marokko', countryCode: 'MAR', flag: 'ma' },
  { name: 'Soufiane Boufal', country: 'Marokko', countryCode: 'MAR', flag: 'ma' },
  // Senegal
  { name: 'Sadio Mané', country: 'Senegal', countryCode: 'SEN', flag: 'sn' },
  { name: 'Ismaïla Sarr', country: 'Senegal', countryCode: 'SEN', flag: 'sn' },
  { name: 'Nicolas Jackson', country: 'Senegal', countryCode: 'SEN', flag: 'sn' },
  // Nigeria
  { name: 'Victor Osimhen', country: 'Nigeria', countryCode: 'NGA', flag: 'ng' },
  { name: 'Ademola Lookman', country: 'Nigeria', countryCode: 'NGA', flag: 'ng' },
  { name: 'Samuel Chukwueze', country: 'Nigeria', countryCode: 'NGA', flag: 'ng' },
  // Ghana
  { name: 'Mohammed Kudus', country: 'Ghana', countryCode: 'GHA', flag: 'gh' },
  { name: 'Jordan Ayew', country: 'Ghana', countryCode: 'GHA', flag: 'gh' },
  { name: 'Antoine Semenyo', country: 'Ghana', countryCode: 'GHA', flag: 'gh' },
  // Japan
  { name: 'Takefusa Kubo', country: 'Japan', countryCode: 'JPN', flag: 'jp' },
  { name: 'Kaoru Mitoma', country: 'Japan', countryCode: 'JPN', flag: 'jp' },
  { name: 'Ayase Ueda', country: 'Japan', countryCode: 'JPN', flag: 'jp' },
  { name: 'Ritsu Doan', country: 'Japan', countryCode: 'JPN', flag: 'jp' },
  // Südkorea
  { name: 'Son Heung-min', country: 'Südkorea', countryCode: 'KOR', flag: 'kr' },
  { name: 'Hwang Hee-chan', country: 'Südkorea', countryCode: 'KOR', flag: 'kr' },
  { name: 'Lee Kang-in', country: 'Südkorea', countryCode: 'KOR', flag: 'kr' },
  // Iran
  { name: 'Mehdi Taremi', country: 'Iran', countryCode: 'IRN', flag: 'ir' },
  { name: 'Sardar Azmoun', country: 'Iran', countryCode: 'IRN', flag: 'ir' },
  { name: 'Alireza Jahanbakhsh', country: 'Iran', countryCode: 'IRN', flag: 'ir' },
  // Saudi-Arabien
  { name: 'Salem Al-Dawsari', country: 'Saudi-Arabien', countryCode: 'SAU', flag: 'sa' },
  { name: 'Firas Al-Buraikan', country: 'Saudi-Arabien', countryCode: 'SAU', flag: 'sa' },
  // Australien
  { name: 'Mitchell Duke', country: 'Australien', countryCode: 'AUS', flag: 'au' },
  { name: 'Martin Boyle', country: 'Australien', countryCode: 'AUS', flag: 'au' },
  { name: 'Jamie Maclaren', country: 'Australien', countryCode: 'AUS', flag: 'au' },
  // Kroatien
  { name: 'Luka Modrić', country: 'Kroatien', countryCode: 'CRO', flag: 'hr' },
  { name: 'Ivan Perišić', country: 'Kroatien', countryCode: 'CRO', flag: 'hr' },
  { name: 'Andrej Kramarić', country: 'Kroatien', countryCode: 'CRO', flag: 'hr' },
  { name: 'Bruno Petković', country: 'Kroatien', countryCode: 'CRO', flag: 'hr' },
  // Türkei
  { name: 'Arda Güler', country: 'Türkei', countryCode: 'TUR', flag: 'tr' },
  { name: 'Hakan Çalhanoğlu', country: 'Türkei', countryCode: 'TUR', flag: 'tr' },
  { name: 'Kerem Aktürkoğlu', country: 'Türkei', countryCode: 'TUR', flag: 'tr' },
  { name: 'Cenk Tosun', country: 'Türkei', countryCode: 'TUR', flag: 'tr' },
  // Polen
  { name: 'Robert Lewandowski', country: 'Polen', countryCode: 'POL', flag: 'pl' },
  { name: 'Piotr Zielinski', country: 'Polen', countryCode: 'POL', flag: 'pl' },
  { name: 'Arkadiusz Milik', country: 'Polen', countryCode: 'POL', flag: 'pl' },
  // Schweiz
  { name: 'Breel Embolo', country: 'Schweiz', countryCode: 'SUI', flag: 'ch' },
  { name: 'Granit Xhaka', country: 'Schweiz', countryCode: 'SUI', flag: 'ch' },
  { name: 'Xherdan Shaqiri', country: 'Schweiz', countryCode: 'SUI', flag: 'ch' },
  { name: 'Noah Okafor', country: 'Schweiz', countryCode: 'SUI', flag: 'ch' },
  // Österreich
  { name: 'Marcel Sabitzer', country: 'Österreich', countryCode: 'AUT', flag: 'at' },
  { name: 'Marko Arnautović', country: 'Österreich', countryCode: 'AUT', flag: 'at' },
  { name: 'Michael Gregoritsch', country: 'Österreich', countryCode: 'AUT', flag: 'at' },
  // Elfenbeinküste
  { name: 'Sébastien Haller', country: 'Elfenbeinküste', countryCode: 'CIV', flag: 'ci' },
  { name: 'Franck Kessié', country: 'Elfenbeinküste', countryCode: 'CIV', flag: 'ci' },
  { name: 'Nicolas Pépé', country: 'Elfenbeinküste', countryCode: 'CIV', flag: 'ci' },
  // Tschechien
  { name: 'Tomáš Souček', country: 'Tschechien', countryCode: 'CZE', flag: 'cz' },
  { name: 'Patrik Schick', country: 'Tschechien', countryCode: 'CZE', flag: 'cz' },
  // Serbien
  { name: 'Dušan Vlahović', country: 'Serbien', countryCode: 'SRB', flag: 'rs' },
  { name: 'Aleksandar Mitrović', country: 'Serbien', countryCode: 'SRB', flag: 'rs' },
  { name: 'Filip Kostić', country: 'Serbien', countryCode: 'SRB', flag: 'rs' },
  // Ecuador
  { name: 'Enner Valencia', country: 'Ecuador', countryCode: 'ECU', flag: 'ec' },
  { name: 'Moisés Caicedo', country: 'Ecuador', countryCode: 'ECU', flag: 'ec' },
  { name: 'Gonzalo Plata', country: 'Ecuador', countryCode: 'ECU', flag: 'ec' },
  // Kanada
  { name: 'Alphonso Davies', country: 'Kanada', countryCode: 'CAN', flag: 'ca' },
  { name: 'Jonathan David', country: 'Kanada', countryCode: 'CAN', flag: 'ca' },
  { name: 'Tajon Buchanan', country: 'Kanada', countryCode: 'CAN', flag: 'ca' },
  // Kamerun
  { name: 'Vincent Aboubakar', country: 'Kamerun', countryCode: 'CMR', flag: 'cm' },
  { name: 'Bryan Mbeumo', country: 'Kamerun', countryCode: 'CMR', flag: 'cm' },
  { name: 'Karl Toko Ekambi', country: 'Kamerun', countryCode: 'CMR', flag: 'cm' },
]

// Sort by country, then name
export const PLAYERS_SORTED = [...WM2026_PLAYERS].sort((a, b) =>
  a.country.localeCompare(b.country, 'de') || a.name.localeCompare(b.name, 'de')
)
