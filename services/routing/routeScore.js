export function scoreRoute(route, mode = 'normal') {

  if (!route) {
    return -Infinity;
  }

  let score = 100;


  // =====================================
  // DŁUGOŚĆ
  // =====================================

  const distanceKm =
    route.distance / 1000;

  // Każdy kilometr trochę obniża wynik
  score -= distanceKm * 1.5;


  // =====================================
  // CZAS
  // =====================================

  const durationMin =
    route.duration / 60;

  score -= durationMin * 0.15;


  // =====================================
  // ODKRYWCA
  // =====================================

  if (mode === 'explorer') {

    // Odkrywca może zaakceptować
    // dłuższą trasę w zamian za
    // bardziej lokalny charakter.

    score += 10;

  }


  // =====================================
  // TEREN
  // =====================================

  if (mode === 'terrain') {

    // Jeszcze większa tolerancja
    // na wydłużenie trasy.

    score += 20;

  }


  return score;
}


export function chooseBestRoute(
  routes,
  mode = 'normal'
) {

  if (
    !routes ||
    routes.length === 0
  ) {
    return null;
  }


  let bestRoute =
    routes[0];

  let bestScore =
    scoreRoute(
      bestRoute,
      mode
    );


  for (
    let i = 1;
    i < routes.length;
    i++
  ) {

    const currentRoute =
      routes[i];

    const currentScore =
      scoreRoute(
        currentRoute,
        mode
      );


    if (
      currentScore >
      bestScore
    ) {

      bestRoute =
        currentRoute;

      bestScore =
        currentScore;

    }

  }


  return {
    ...bestRoute,

    crossNavScore:
      bestScore,

    crossNavMode:
      mode
  };

}
