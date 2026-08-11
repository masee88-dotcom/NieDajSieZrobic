export function scoreRoute(
  route,
  mode = 'normal'
) {

  if (!route) {
    return -Infinity;
  }

  let score = 0;


  // Krótsza trasa = lepiej
  score -=
    route.distance / 1000;


  // Odkrywca może zaakceptować
  // trochę dłuższą trasę
  if (mode === 'explorer') {
    score += 20;
  }


  // Teren może zaakceptować
  // jeszcze większe wydłużenie
  if (mode === 'terrain') {
    score += 40;
  }


  return score;
}


export function chooseBestRoute(
  routes,
  mode = 'normal'
) {

  if (!routes || !routes.length) {
    return null;
  }


  let best = routes[0];

  let bestScore =
    scoreRoute(
      best,
      mode
    );


  for (
    let i = 1;
    i < routes.length;
    i++
  ) {

    const current =
      scoreRoute(
        routes[i],
        mode
      );


    if (current > bestScore) {

      best = routes[i];

      bestScore = current;

    }

  }


  return best;

}
